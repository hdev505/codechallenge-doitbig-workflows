interface FormFieldSelectProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  formKeys: string[]
}

export function FormFieldSelect({ id, label, value, onChange, formKeys }: FormFieldSelectProps) {
  const options = formKeys.length > 0 ? formKeys : ['email', 'name']
  const valueInOptions = options.includes(value)

  return (
    <div className="interp-field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <select id={id} className="field-input" value={valueInOptions ? value : ''} onChange={(e) => onChange(e.target.value)}>
        {!valueInOptions && value && (
          <option value="" disabled>
            {value} (not in sample data)
          </option>
        )}
        {!valueInOptions && !value && (
          <option value="" disabled>
            Pick a field…
          </option>
        )}
        {options.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>
    </div>
  )
}
