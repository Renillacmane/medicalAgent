import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsService } from './recommendations.service';
import { PatientsService } from '../patients/patients.service';
import type { TextGenerator, TextGenerationResult } from '../llm/interfaces/text';
import { LLM_TEXT_GENERATOR } from '../llm/interfaces/text';
import { RAG_SERVICE, IRagService, RagChunk } from '../rag/rag.interface';
import { SystemPromptBuilder } from '../llm/prompts/system-prompt.builder';
import { PatientSnapshotDto } from '../patients/dto/patient-snapshot.dto';

describe('RecommendationsService', () => {
  let service: RecommendationsService;
  let patientsService: jest.Mocked<PatientsService>;
  let textGenerator: jest.Mocked<TextGenerator>;
  let ragService: jest.Mocked<IRagService>;
  let promptBuilder: SystemPromptBuilder;

  const mockSnapshot: PatientSnapshotDto = {
    profile: {
      id: 'user-123',
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-15'),
      email: 'jane@example.com',
      isActive: true,
      height: 165,
      weight: 60,
      dietaryPreference: { type: 'vegetarian' },
      objectives: { health: ['improve sleep'], body: ['maintain weight'] },
    },
    vitals: [
      {
        id: 'vital-1',
        date: new Date('2024-01-15'),
        heartRate: 72,
        bloodPressure: { systolic: 120, diastolic: 80 },
        sleepHours: 7,
        stressPerception: 4,
      },
    ],
  };

  const mockLlmResponse: TextGenerationResult = {
    text: JSON.stringify({
      summary: 'Great job maintaining your health routine!',
      recommendations: {
        nutrition: ['Try adding more leafy greens to your meals'],
        exercise: ['A 20-minute walk would be beneficial'],
        lifestyle: ['Consider a consistent bedtime routine'],
        alerts: ['Your sleep has been good recently'],
      },
    }),
    usage: { inputTokens: 100, outputTokens: 50 },
  };

  beforeEach(async () => {
    const mockPatientsService = {
      getPatientSnapshotForAgent: jest.fn(),
    };

    const mockTextGenerator: jest.Mocked<TextGenerator> = {
      generate: jest.fn(),
    };

    const mockRagService: jest.Mocked<IRagService> = {
      retrieve: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        SystemPromptBuilder,
        { provide: PatientsService, useValue: mockPatientsService },
        { provide: LLM_TEXT_GENERATOR, useValue: mockTextGenerator },
        { provide: RAG_SERVICE, useValue: mockRagService },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
    patientsService = module.get(PatientsService);
    textGenerator = module.get(LLM_TEXT_GENERATOR);
    ragService = module.get(RAG_SERVICE);
    promptBuilder = module.get(SystemPromptBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDailyRecommendations', () => {
    it('should generate recommendations successfully', async () => {
      patientsService.getPatientSnapshotForAgent.mockResolvedValue(mockSnapshot);
      ragService.retrieve.mockResolvedValue([]);
      textGenerator.generate.mockResolvedValue(mockLlmResponse);

      const result = await service.getDailyRecommendations('user-123');

      expect(result.summary).toBe('Great job maintaining your health routine!');
      expect(result.recommendations.nutrition).toHaveLength(1);
      expect(result.recommendations.exercise).toHaveLength(1);
      expect(result.recommendations.lifestyle).toHaveLength(1);
      expect(result.recommendations.alerts).toHaveLength(1);
      expect(result.generatedAt).toBeInstanceOf(Date);
    });

    it('should call services in correct order', async () => {
      patientsService.getPatientSnapshotForAgent.mockResolvedValue(mockSnapshot);
      ragService.retrieve.mockResolvedValue([]);
      textGenerator.generate.mockResolvedValue(mockLlmResponse);

      await service.getDailyRecommendations('user-123');

      expect(patientsService.getPatientSnapshotForAgent).toHaveBeenCalledWith(
        'user-123',
        30,
      );
      expect(ragService.retrieve).toHaveBeenCalledWith('user-123', undefined, {
        limit: 5,
      });
      expect(textGenerator.generate).toHaveBeenCalled();
    });

    it('should skip RAG when includeRag is false', async () => {
      patientsService.getPatientSnapshotForAgent.mockResolvedValue(mockSnapshot);
      textGenerator.generate.mockResolvedValue(mockLlmResponse);

      await service.getDailyRecommendations('user-123', { includeRag: false });

      expect(ragService.retrieve).not.toHaveBeenCalled();
    });

    it('should return empty recommendation when profile is missing', async () => {
      patientsService.getPatientSnapshotForAgent.mockResolvedValue({
        profile: null,
        vitals: [],
      });

      const result = await service.getDailyRecommendations('user-123');

      expect(result.summary).toBe('No recommendations available at this time.');
      expect(textGenerator.generate).not.toHaveBeenCalled();
    });

    it('should handle RAG retrieval failure gracefully', async () => {
      patientsService.getPatientSnapshotForAgent.mockResolvedValue(mockSnapshot);
      ragService.retrieve.mockRejectedValue(new Error('RAG error'));
      textGenerator.generate.mockResolvedValue(mockLlmResponse);

      const result = await service.getDailyRecommendations('user-123');

      expect(result.summary).toBe('Great job maintaining your health routine!');
    });

    it('should include RAG chunks in prompt when available', async () => {
      const ragChunks: RagChunk[] = [
        { content: 'Sleep hygiene tips...', source: 'health-guide.pdf' },
      ];

      patientsService.getPatientSnapshotForAgent.mockResolvedValue(mockSnapshot);
      ragService.retrieve.mockResolvedValue(ragChunks);
      textGenerator.generate.mockResolvedValue(mockLlmResponse);

      await service.getDailyRecommendations('user-123');

      const callArgs = textGenerator.generate.mock.calls[0];
      const input = callArgs[0];

      expect(input.prompt).toContain('Sleep hygiene tips...');
    });

    it('should handle malformed JSON response', async () => {
      patientsService.getPatientSnapshotForAgent.mockResolvedValue(mockSnapshot);
      ragService.retrieve.mockResolvedValue([]);
      textGenerator.generate.mockResolvedValue({
        text: 'This is not valid JSON at all',
      });

      const result = await service.getDailyRecommendations('user-123');

      expect(result.summary).toBe('This is not valid JSON at all');
      expect(result.recommendations).toEqual({});
    });

    it('should extract JSON from mixed content response', async () => {
      patientsService.getPatientSnapshotForAgent.mockResolvedValue(mockSnapshot);
      ragService.retrieve.mockResolvedValue([]);
      textGenerator.generate.mockResolvedValue({
        text:
          'Here are your recommendations:\n' +
          JSON.stringify({
            summary: 'Stay hydrated!',
            recommendations: { nutrition: ['Drink water'] },
          }) +
          '\nHope this helps!',
      });

      const result = await service.getDailyRecommendations('user-123');

      expect(result.summary).toBe('Stay hydrated!');
      expect(result.recommendations.nutrition).toEqual(['Drink water']);
    });

    it('should pass custom vitalsLimit option', async () => {
      patientsService.getPatientSnapshotForAgent.mockResolvedValue(mockSnapshot);
      ragService.retrieve.mockResolvedValue([]);
      textGenerator.generate.mockResolvedValue(mockLlmResponse);

      await service.getDailyRecommendations('user-123', { vitalsLimit: 10 });

      expect(patientsService.getPatientSnapshotForAgent).toHaveBeenCalledWith(
        'user-123',
        10,
      );
    });

    it('should pass temperature option to LLM', async () => {
      patientsService.getPatientSnapshotForAgent.mockResolvedValue(mockSnapshot);
      ragService.retrieve.mockResolvedValue([]);
      textGenerator.generate.mockResolvedValue(mockLlmResponse);

      await service.getDailyRecommendations('user-123', { temperature: 0.5 });

      expect(textGenerator.generate).toHaveBeenCalledWith(
        expect.objectContaining({ temperature: 0.5 }),
      );
    });
  });

  describe('prompt building', () => {
    it('should include safety rules in system prompt', async () => {
      patientsService.getPatientSnapshotForAgent.mockResolvedValue(mockSnapshot);
      ragService.retrieve.mockResolvedValue([]);
      textGenerator.generate.mockResolvedValue(mockLlmResponse);

      await service.getDailyRecommendations('user-123');

      const callArgs = textGenerator.generate.mock.calls[0];
      const input = callArgs[0];

      expect(input.system).toContain('NO DIAGNOSIS');
      expect(input.system).toContain('NO CRITICAL/EMERGENCY ADVICE');
      expect(input.system).toContain('NO MEDICATION CHANGES');
      expect(input.system).toContain('SUPPORTIVE LANGUAGE');
    });

    it('should include patient context in user prompt', async () => {
      patientsService.getPatientSnapshotForAgent.mockResolvedValue(mockSnapshot);
      ragService.retrieve.mockResolvedValue([]);
      textGenerator.generate.mockResolvedValue(mockLlmResponse);

      await service.getDailyRecommendations('user-123');

      const callArgs = textGenerator.generate.mock.calls[0];
      const input = callArgs[0];

      expect(input.prompt).toContain('Jane Doe');
      expect(input.prompt).toContain('Height: 165 cm');
      expect(input.prompt).toContain('vegetarian');
    });
  });
});
