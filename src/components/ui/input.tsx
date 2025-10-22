import * as React from 'react';
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import { useController } from 'react-hook-form';
import type { TextInputProps } from 'react-native';
import {
  I18nManager,
  StyleSheet,
  TextInput as NTextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { tv } from 'tailwind-variants';

import { Eye } from './icons/eye';
import { Text } from './text';

const inputTv = tv({
  slots: {
    container: 'mb-4 relative',
    // Floating label that sits on the border
    label: 'absolute left-3 -top-2.5 bg-white px-2 text-sm font-brownstd text-gray-700 z-10 text-[12px]',
    input:
      'text-gray-900 flex-1 border-0 bg-transparent px-4 py-5 font-brownstd text-base font-normal leading-5 text-[16px]',
    startIconContainer: 'pl-4',
    endIconContainer: 'pr-4',
    inputContainer:
      'flex-row items-center rounded-lg border-2 border-[#BDBDBD] bg-white relative',
  },

  variants: {
    focused: {
      true: {
        inputContainer: 'border-black',
        label: 'text-black',
      },
    },
    error: {
      true: {
        inputContainer: 'border-red-500',
        label: 'text-red-500',
      },
    },
    disabled: {
      true: {
        inputContainer: 'bg-gray-100 border-gray-200',
        input: 'text-gray-400',
        label: 'text-gray-400',
      },
    },
    multiline: {
      true: {
        inputContainer: 'items-start',
        input: 'text-top min-h-[120px] py-4',
      },
    },
  },
  defaultVariants: {
    focused: false,
    error: false,
    disabled: false,
    multiline: false,
  },
});

export interface NInputProps extends TextInputProps {
  label?: string;
  disabled?: boolean;
  error?: string;
  startImage?: React.ReactNode;
  endImage?: React.ReactNode;
  isPassword?: boolean;
  multiline?: boolean;
  inputContainerClassName?: string;
  placeholderTextColor?: string;
  inputClassName?: string;
  labelClassName?: string;
}

type TRule<T extends FieldValues> =
  | Omit<
      RegisterOptions<T>,
      'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'
    >
  | undefined;

export type RuleType<T extends FieldValues> = { [name in keyof T]: TRule<T> };
export type InputControllerType<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  rules?: RuleType<T>;
};

interface ControlledInputProps<T extends FieldValues>
  extends NInputProps,
    InputControllerType<T> {}

export const Input = React.forwardRef<NTextInput, NInputProps>((props, ref) => {
  const {
    label,
    error,
    startImage,
    endImage,
    isPassword,
    multiline,
    inputContainerClassName,
    inputClassName,
    labelClassName,
    secureTextEntry,
    placeholderTextColor = '#9CA3AF',
    disabled,
    ...inputProps
  } = props;

  const [isFocussed, setIsFocussed] = React.useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  
  const onBlur = React.useCallback(() => setIsFocussed(false), []);
  const onFocus = React.useCallback(() => setIsFocussed(true), []);

  const togglePasswordVisibility = React.useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  const styles = React.useMemo(
    () =>
      inputTv({
        error: Boolean(error),
        focused: isFocussed,
        disabled: Boolean(disabled),
        multiline: Boolean(multiline),
      }),
    [error, isFocussed, disabled, multiline]
  );

  const showPasswordToggle = isPassword || secureTextEntry;
  const currentSecureTextEntry = showPasswordToggle
    ? !isPasswordVisible
    : secureTextEntry;

  return (
    <View className={styles.container()}>
      {/* Input Container */}
      <View
        className={styles.inputContainer({
          className: inputContainerClassName,
        })}
      >
        {startImage && (
          <View className={styles.startIconContainer()}>{startImage}</View>
        )}
        
        <NTextInput
          ref={ref}
          placeholderTextColor={placeholderTextColor}
          multiline={multiline}
          editable={!disabled}
          className={styles.input({
            className: inputClassName,
          })}
          onBlur={onBlur}
          onFocus={onFocus}
          secureTextEntry={currentSecureTextEntry}
          {...inputProps}
          style={StyleSheet.flatten([
            { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
            { textAlign: I18nManager.isRTL ? 'right' : 'left' },
            inputProps.style,
          ])}
        />
        
        {showPasswordToggle && (
          <TouchableOpacity
            className={styles.endIconContainer()}
            onPress={togglePasswordVisibility}
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible ? 'Hide password' : 'Show password'
            }
          >
            {isPasswordVisible ? <Eye /> : <Eye />}
          </TouchableOpacity>
        )}
        
        {endImage && !showPasswordToggle && (
          <View className="absolute right-3 top-1/2 -translate-y-1/2">{endImage}</View>
        )}
      </View>

      {/* Floating Label - positioned absolutely to sit on the border */}
      {label && (
        <Text
          className={styles.label({
            className: labelClassName,
          })}
        >
          {label}
        </Text>
      )}

      {/* Error Message */}
      {error && <Text className="text-sm text-red-500 mt-1">{error}</Text>}
    </View>
  );
});

// only used with react-hook-form
export function ControlledInput<T extends FieldValues>(
  props: ControlledInputProps<T>
) {
  const { name, control, rules, ...inputProps } = props;

  const { field, fieldState } = useController({ control, name, rules });
  return (
    <Input
      ref={field.ref}
      autoCapitalize="none"
      onChangeText={field.onChange}
      value={(field.value as string) || ''}
      {...inputProps}
      error={fieldState.error?.message}
    />
  );
}