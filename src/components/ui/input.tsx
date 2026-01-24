/* eslint-disable max-lines-per-function */
import { EyeIcon } from 'phosphor-react-native/src/icons/Eye';
import { EyeSlashIcon } from 'phosphor-react-native/src/icons/EyeSlash';
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

import { Text } from './text';

const inputTv = tv({
  slots: {
    container: 'relative mb-4',
    // Floating label that sits on the border
    label:
      'absolute -top-2.5 left-3 z-10 bg-white px-2 font-brownstd text-[12px] text-sm text-gray-700',
    input:
      'flex-1 border-0 bg-transparent px-4 py-5 font-brownstd text-[16px] text-base font-normal leading-5 text-gray-900',
    startIconContainer: 'pl-4',
    endIconContainer: 'pr-4',
    inputContainer:
      'relative flex-row items-center rounded-lg border-2 border-[#BDBDBD] bg-white',
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
        inputContainer: 'border-gray-200 bg-gray-100',
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
            activeOpacity={0.9}
            className={styles.endIconContainer()}
            onPress={togglePasswordVisibility}
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible ? 'Hide password' : 'Show password'
            }
          >
            {isPasswordVisible ? <EyeIcon /> : <EyeSlashIcon />}
          </TouchableOpacity>
        )}

        {endImage && !showPasswordToggle && (
          <View className="absolute right-3 top-1/2 -translate-y-1/2">
            {endImage}
          </View>
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
      {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
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
