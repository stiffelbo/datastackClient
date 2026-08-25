import { FormSchema, FormField } from "../hooks/useEntityTypes";

export type FormFieldPatch = Record<
  string,
  Partial<Omit<FormField, "name">>
>;

export const mergeIntoFormSchema = (
  formSchema: FormSchema,
  patch: FormFieldPatch,
): FormSchema => {
    console.log(formSchema);
  return {
    ...formSchema,
    schema: formSchema.schema.map((field) => ({
      ...field,
      ...(patch[field.name] ?? {}),
    })),
  };
};