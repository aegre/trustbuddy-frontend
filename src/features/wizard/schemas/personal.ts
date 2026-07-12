import * as yup from "yup";

export const personalSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .max(255, "Name must be at most 255 characters"),
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .email("Enter a valid email")
    .max(255, "Email must be at most 255 characters"),
  age: yup
    .number()
    .transform((value, originalValue) => {
      if (
        originalValue === "" ||
        originalValue === null ||
        originalValue === undefined ||
        (typeof value === "number" && Number.isNaN(value))
      ) {
        return undefined;
      }
      return value;
    })
    .typeError("Age must be a number")
    .required("Age is required")
    .integer("Age must be a whole number")
    .min(1, "Age must be at least 1")
    .max(120, "Age must be at most 120"),
  zipCode: yup
    .string()
    .trim()
    .required("ZIP code is required")
    .matches(/^\d{5}$/, "ZIP code must be 5 digits"),
});

export type PersonalFormValues = yup.InferType<typeof personalSchema>;

export const emptyPersonalDefaults = {
  name: "",
  email: "",
  age: "" as unknown as number,
  zipCode: "",
} satisfies Record<keyof PersonalFormValues, string | number>;
