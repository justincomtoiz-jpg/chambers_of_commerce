// src/components/PreAppForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PreAppSchema } from '../validation/preApplication';
import type { z } from 'zod';

type PreAppInput = z.infer<typeof PreAppSchema>;

export function PreAppForm({
  onSubmit,
  initial,
}: {
  onSubmit: (data: PreAppInput) => void;
  initial?: Partial<PreAppInput>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PreAppInput>({
    resolver: zodResolver(PreAppSchema),
    defaultValues: initial as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register('requestorName')} placeholder="Requestor Name" />
      {errors.requestorName && (
        <div className="text-red-500">{errors.requestorName.message}</div>
      )}

      <input type="date" {...register('dob')} />
      {errors.dob && <div className="text-red-500">{errors.dob.message}</div>}

      <input
        {...register('businessName')}
        placeholder="Business or Event Name"
      />
      <select {...register('type')}>
        <option value="Business">Business</option>
        <option value="Event">Event</option>
        <option value="Freelancer">Freelancer</option>
      </select>

      <textarea {...register('description')} placeholder="Description" />

      <select {...register('location')}>
        {/* populate from streets.json */}
        <option value="vespucci_blvd">Vespucci Blvd</option>
      </select>

      <input
        {...register('budget', { valueAsNumber: true })}
        placeholder="Budget in USD"
      />
      {errors.budget && (
        <div className="text-red-500">{errors.budget.message}</div>
      )}

      <select {...register('category')}>
        <option value="Food">Food</option>
        <option value="Alcohol">Alcohol</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Services">Services</option>
        <option value="Security">Security</option>
        <option value="Transportation">Transportation</option>
      </select>

      <button type="submit" className="btn-primary">
        Submit Pre-Application
      </button>
    </form>
  );
}
