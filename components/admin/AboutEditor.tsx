'use client'

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'

const aboutSchema = z.object({
  heading: z.string().min(1),
  subHeading: z.string().min(1),
  journey: z.object({
    title: z.string().min(1),
    paragraphs: z.array(z.string().min(1)),
  }),
  values: z.array(z.string().min(1)),
  focusAreas: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      icon: z.string().optional(),
    })
  ),
})

type AboutFormData = z.infer<typeof aboutSchema>

export default function AboutEditor() {
  const queryClient = useQueryClient()

  const { data: about, isLoading } = useQuery({
    queryKey: ['about'],
    queryFn: async () => {
      const res = await axios.get('/about')
      return res.data
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: AboutFormData) => {
      const res = await axios.put('/about', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about'] })
      toast.success('About section updated successfully!')
    },
    onError: () => {
      toast.error('Failed to update about section')
    },
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<AboutFormData>({
    resolver: zodResolver(aboutSchema),
    defaultValues: about
      ? {
          heading: about.heading,
          subHeading: about.subHeading,
          journey: {
            title: about.journey?.title || '',
            paragraphs: about.journey?.paragraphs?.map((p: any) => p.content) || [],
          },
          values: about.values?.map((v: any) => v.value) || [],
          focusAreas:
            about.focusAreas?.map((fa: any) => ({
              title: fa.title,
              description: fa.description,
              icon: fa.icon,
            })) || [],
        }
      : undefined,
  })

  const {
    fields: paragraphFields,
    append: appendParagraph,
    remove: removeParagraph,
  } = useFieldArray({
    control,
    name: 'journey.paragraphs' as any,
  })

  const {
    fields: valueFields,
    append: appendValue,
    remove: removeValue,
  } = useFieldArray({
    control,
    name: 'values' as any,
  })

  const {
    fields: focusAreaFields,
    append: appendFocusArea,
    remove: removeFocusArea,
  } = useFieldArray({
    control,
    name: 'focusAreas' as any,
  })

  React.useEffect(() => {
    if (about) {
      reset({
        heading: about.heading,
        subHeading: about.subHeading,
        journey: {
          title: about.journey?.title || '',
          paragraphs: about.journey?.paragraphs?.map((p: any) => p.content) || [],
        },
        values: about.values?.map((v: any) => v.value) || [],
        focusAreas:
          about.focusAreas?.map((fa: any) => ({
            title: fa.title,
            description: fa.description,
            icon: fa.icon,
          })) || [],
      })
    }
  }, [about, reset])

  if (isLoading) {
    return <div>Loading...</div>
  }

  const onSubmit = (data: AboutFormData) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Heading
        </label>
        <input
          {...register('heading')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sub Heading
        </label>
        <textarea
          {...register('subHeading')}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Journey</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Journey Title
          </label>
          <input
            {...register('journey.title')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Paragraphs
            </label>
            <button
              type="button"
              onClick={() => appendParagraph('')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Paragraph
            </button>
          </div>
          {paragraphFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <textarea
                {...register(`journey.paragraphs.${index}`)}
                rows={3}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeParagraph(index)}
                className="px-3 py-2 bg-red-600 text-white rounded-lg"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Personal Values</h3>
          <button
            type="button"
            onClick={() => appendValue('')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Value
          </button>
        </div>
        {valueFields.map((field, index) => (
          <div key={field.id} className="flex gap-2 mb-2">
            <input
              {...register(`values.${index}`)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              type="button"
              onClick={() => removeValue(index)}
              className="px-3 py-2 bg-red-600 text-white rounded-lg"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Focus Areas</h3>
          <button
            type="button"
            onClick={() => appendFocusArea({ title: '', description: '', icon: '' })}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Focus Area
          </button>
        </div>
        {focusAreaFields.map((field, index) => (
          <div key={field.id} className="border p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4 mb-2">
              <input
                {...register(`focusAreas.${index}.title`)}
                placeholder="Title"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                {...register(`focusAreas.${index}.icon`)}
                placeholder="Icon (optional)"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <textarea
              {...register(`focusAreas.${index}.description`)}
              placeholder="Description"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
            />
            <button
              type="button"
              onClick={() => removeFocusArea(index)}
              className="px-3 py-2 bg-red-600 text-white rounded-lg"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50"
      >
        {mutation.isPending ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}

