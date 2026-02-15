import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PreAppSchema } from '../validation/preApp';
import type { z } from 'zod';
import api from '../api/client';

type Input = z.infer<typeof PreAppSchema>;

export function PreAppForm({
  onSubmit,
  onCancel,
  initial,
}: {
  onSubmit: (d: Input) => void;
  onCancel?: () => void;
  initial?: Partial<Input>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Input>({
    resolver: zodResolver(PreAppSchema),
    defaultValues: initial as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form">
      <label>Requestor Name</label>
      <input {...register('requestorName')} />
      {errors.requestorName && (
        <div className="error">{errors.requestorName.message}</div>
      )}

      <label>Date of Birth</label>
      <input type="date" {...register('dob')} />
      {errors.dob && <div className="error">{errors.dob.message}</div>}

      <label>Business/Event Name</label>
      <input {...register('businessName')} />
      {errors.businessName && (
        <div className="error">{errors.businessName.message}</div>
      )}

      <label>Type</label>
      <select {...register('type')}>
        <option value="Business">Business</option>
        <option value="Event">Event</option>
        <option value="Freelancer">Freelancer</option>
      </select>

      <label>Description</label>
      <textarea {...register('description')} />

      <label>Location</label>
      <LocationSelect register={register} />

      <label>Budget (USD)</label>
      <input type="number" {...register('budget', { valueAsNumber: true })} />

      <label>Category</label>
      <select {...register('category')}>
        <option value="Food">Food</option>
        <option value="Alcohol">Alcohol</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Services">Services</option>
        <option value="Security">Security</option>
        <option value="Transportation">Transportation</option>
      </select>

      <div className="form-actions">
        <button type="submit">Submit</button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function LocationSelect({ register }: any) {
  const [streets, setStreets] = React.useState<
    { id: string; code: string; name: string }[]
  >([]);
  React.useEffect(() => {
    api
      .get('/api/streets')
      .then((r) => setStreets(r.data))
      .catch(() => {
        // fallback
        setStreets([
          { id: 'vespucci_blvd', code: 'vespucci_blvd', name: 'Vespucci Blvd' },
        ]);
      });
  }, []);
  return (
    <select {...register('location')}>
      {streets.map((s) => (
        <option key={s.id} value={s.code}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
