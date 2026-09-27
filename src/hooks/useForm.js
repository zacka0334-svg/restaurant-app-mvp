import { useCallback, useMemo, useState } from 'react';

// Generic form hook.
//   const { values, errors, handleChange, handleSubmit, reset, isValid } =
//     useForm(initialValues, validate);
// - validate(values) returns an object { field: 'message' } (empty = valid).
// - handleChange(field) returns an onChangeText handler; editing a field
//   clears that field's error immediately.
// - handleSubmit(onValid) validates everything and calls onValid(values)
//   only when there are no errors.
// Hook rules: name starts with "use", only calls hooks at the top level,
// returns data and functions, never JSX.
export default function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback(
    (field) => (value) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const { [field]: _removed, ...rest } = prev;
        return rest;
      });
    },
    []
  );

  const handleSubmit = useCallback(
    (onValid) => {
      const nextErrors = validate ? validate(values) : {};
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length === 0) {
        return onValid(values);
      }
      return undefined;
    },
    [validate, values]
  );

  const reset = useCallback((nextValues = initialValues) => {
    setValues(nextValues);
    setErrors({});
    // initialValues is expected to be a constant object defined outside the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived value, not state.
  const isValid = useMemo(() => (validate ? Object.keys(validate(values)).length === 0 : true), [validate, values]);

  return { values, errors, handleChange, handleSubmit, reset, isValid, setErrors };
}
