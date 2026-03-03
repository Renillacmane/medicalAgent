/**
 * Format patient snapshot as text for LLM context.
 * Consumes PatientSnapshotDto (from patients module) and produces a string for prompts.
 */

import { calculateAge } from '../../common/utils/date.utils';
import type { PatientSnapshotDto } from '../../patients/dto/patient-snapshot.dto';

export function formatPatientSnapshotForLlm(snapshot: PatientSnapshotDto): string {
  const lines: string[] = [];

  if (snapshot.profile) {
    const p = snapshot.profile;
    const age = calculateAge(p.dateOfBirth);
    lines.push(`Patient: ${p.firstName} ${p.lastName}, age ${age}`);

    if (p.height) lines.push(`Height: ${p.height} cm`);
    if (p.weight) lines.push(`Weight: ${p.weight} kg`);

    if (p.dietaryPreference?.type) {
      const diet = p.dietaryPreference;
      let dietStr = `Diet: ${diet.type}`;
      if (diet.restrictions?.length) {
        dietStr += ` (restrictions: ${diet.restrictions.join(', ')})`;
      }
      lines.push(dietStr);
    }

    if (p.objectives) {
      const obj = p.objectives;
      const objParts: string[] = [];
      if (obj.body?.length) objParts.push(`body: ${obj.body.join(', ')}`);
      if (obj.health?.length) objParts.push(`health: ${obj.health.join(', ')}`);
      if (obj.mind?.length) objParts.push(`mind: ${obj.mind.join(', ')}`);
      if (objParts.length) {
        lines.push(`Objectives: ${objParts.join('; ')}`);
      }
    }
  }

  if (snapshot.vitals.length > 0) {
    lines.push('');
    lines.push('Recent vitals:');

    const recentVitals = snapshot.vitals.slice(0, 5);
    for (const v of recentVitals) {
      const date = new Date(v.date).toISOString().split('T')[0];
      const parts: string[] = [`${date}:`];

      if (v.heartRate) parts.push(`HR ${v.heartRate} bpm`);
      if (v.bloodPressure) {
        parts.push(`BP ${v.bloodPressure.systolic}/${v.bloodPressure.diastolic}`);
      }
      if (v.weight) parts.push(`Weight ${v.weight} kg`);
      if (v.bmi) parts.push(`BMI ${v.bmi}`);
      if (v.sleepHours) parts.push(`Sleep ${v.sleepHours}h`);
      if (v.stressPerception) parts.push(`Stress ${v.stressPerception}/10`);
      if (v.bloodOxygen) parts.push(`SpO2 ${v.bloodOxygen}%`);
      if (v.bloodGlucose) parts.push(`Glucose ${v.bloodGlucose}`);

      if (parts.length > 1) {
        lines.push(`  ${parts.join(', ')}`);
      }
    }

    if (snapshot.vitals.length > 5) {
      lines.push(`  ... and ${snapshot.vitals.length - 5} more records`);
    }
  }

  if (snapshot.medications?.length) {
    lines.push('');
    lines.push('Current medications:');
    for (const m of snapshot.medications) {
      const parts: string[] = [m.name];
      if (m.dosage) parts.push(m.dosage);
      if (m.frequency) parts.push(`(${m.frequency})`);
      lines.push(`  - ${parts.join(' ')}`);
    }
  }

  return lines.join('\n');
}
