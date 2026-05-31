import { Children, cloneElement, isValidElement, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';

type BaseProps = {
  label: string;
  children?: ReactNode;
};

export function FormField({
  label,
  children,
  ...props
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const { t } = usePreferences();

  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      <span>{t(label)}</span>
      {children ?? (
        <input
          {...props}
          placeholder={typeof props.placeholder === 'string' ? t(props.placeholder) : props.placeholder}
          className="focus-ring h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
        />
      )}
    </label>
  );
}

export function SelectField({
  label,
  children,
  ...props
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const { t } = usePreferences();
  const translatedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) {
      return typeof child === 'string' ? t(child) : child;
    }

    const childProps = child.props as { children?: ReactNode };
    if (typeof childProps.children !== 'string') {
      return child;
    }

    return cloneElement(child, undefined, t(childProps.children));
  });

  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      <span>{t(label)}</span>
      <select
        {...props}
        className="focus-ring h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
      >
        {translatedChildren}
      </select>
    </label>
  );
}
