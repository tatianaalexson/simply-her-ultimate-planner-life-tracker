import { useEntityList } from '@/hooks/useEntityList';

// Convenience hook for the kind-discriminated HealthRecord entity.
// Pass { kinds: [...], relatedConditionId, medicationId, relatedAppointmentId, ... }
// to filter. Multiple kinds use $in. Sorted newest-first by log_date.
//
// Examples:
//   useHealthRecords({ kinds: ['symptom'] })
//   useHealthRecords({ kinds: ['flare','dose','med_change'], medicationId: medId })
//   useHealthRecords({ relatedConditionId: condId })  // all events for a condition
export function useHealthRecords({ kinds, relatedConditionId, relatedAppointmentId, relatedTestId, medicationId, providerId, domain } = {}) {
  const query = {};
  if (kinds && kinds.length) query.kind = kinds.length === 1 ? kinds[0] : { $in: kinds };
  if (relatedConditionId) query.related_condition_id = relatedConditionId;
  if (relatedAppointmentId) query.related_appointment_id = relatedAppointmentId;
  if (relatedTestId) query.related_test_id = relatedTestId;
  if (medicationId) query.medication_id = medicationId;
  if (providerId) query.provider_id = providerId;
  if (domain) query.domain = domain;
  return useEntityList('HealthRecord', query, '-log_date');
}