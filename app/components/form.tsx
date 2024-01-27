import { Form, useNavigation, useSearchParams } from '@remix-run/react';
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
} from 'react';
import { classNames } from '~/utils/misc';
import { SearchIcon } from './icons';
import { forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={classNames(
        'flex px-3 py-2 rounded-md justify-center',
        className,
      )}
    >
      {children}
    </button>
  );
};

export const PrimaryButton = ({
  className,
  isLoading,
  ...props
}: ButtonProps) => {
  return (
    <Button
      {...props}
      className={classNames(
        'text-white bg-primary hover:bg-primary-light',
        isLoading ? 'bg-primary-light' : '',
        className,
      )}
    ></Button>
  );
};

export function DeleteButton({ className, isLoading, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      className={classNames(
        'border-2 border-red-600 text-red-600',
        'hover:bg-red-600 hover:text-white',
        isLoading ? 'border-red-400 text-red-400' : '',
        className,
      )}
    />
  );
}

interface ErrorMessageProps extends HTMLAttributes<HTMLParagraphElement> {}

export function ErrorMessage({ className, ...props }: ErrorMessageProps) {
  return props.children ? (
    <p {...props} className={classNames('text-red-600 text-xs', className)}></p>
  ) : null;
}

interface PrimaryInputProps extends InputHTMLAttributes<HTMLInputElement> {}
export function PrimaryInput({ className, ...props }: PrimaryInputProps) {
  return (
    <input
      {...props}
      className={classNames(
        'w-full outline-none border-2 border-gray-200',
        'focus:border-primary rounded-md p-2',
        className,
      )}
    />
  );
}

type SearchBarProps = {
  placeholder?: string;
  className?: string;
};

export function SearchBar({ placeholder, className }: SearchBarProps) {
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching = navigation.formData?.has('q');

  return (
    <Form
      className={classNames(
        'flex border-2 border-gray-300 rounded-md',
        'focus-within:border-primary',
        isSearching ? 'animate-pulse' : '',
        className,
      )}
    >
      <button className="px-2 mr-1">
        <SearchIcon />
      </button>
      <input
        defaultValue={searchParams.get('q') ?? ''}
        className="w-full py-3 px-2 outline-none rounded-md"
        type="text"
        name="q"
        autoComplete="off"
        placeholder={placeholder ?? ''}
      />
      {/* invisible inputs to retain the search parameters when the form is submitted */}
      {Array.from(searchParams.entries()).map(([name, value], index) => {
        return name !== 'q' ? (
          <input key={index} name={name} value={value} type="hidden" />
        ) : null;
      })}
    </Form>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={classNames(
          'w-full outline-none',
          'border-b-2 border-b-background focus:border-b-primary',
          error ? 'border-b-red-600' : '',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

interface IconInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
}
export function IconInput({ icon, ...props }: IconInputProps) {
  return (
    <div
      className={classNames(
        'flex items-stretch border-2 border-gray-300 rounded-md',
        'focus-within:border-primary',
      )}
    >
      <div className="px-2 flex flex-col justify-center">{icon}</div>
      <input className="w-full py-3 px-2 outline-none rounded-md" {...props} />
    </div>
  );
}
