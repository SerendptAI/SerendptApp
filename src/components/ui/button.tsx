import React from 'react';
import type { PressableProps, View } from 'react-native';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

const button = tv({
  slots: {
    container: 'my-2 flex flex-row items-center justify-center rounded-xl px-4',
    label: 'font-inter text-base font-medium',
    indicator: 'h-6 text-white',
  },

  variants: {
    variant: {
      default: {
        container: 'bg-brand',
        label: 'text-[#FBFBFB]',
        indicator: 'text-[#FBFBFB]',
      },
      secondary: {
        container: 'bg-primary-600',
        label: 'text-secondary-600',
        indicator: 'text-white',
      },
      outline: {
        container: 'border border-neutral-400',
        label: 'text-black',
        indicator: 'text-black',
      },
      destructive: {
        container: 'bg-red-600',
        label: 'text-white',
        indicator: 'text-white',
      },
      ghost: {
        container: 'bg-transparent',
        label: 'text-black underline',
        indicator: 'text-black',
      },
      link: {
        container: 'bg-transparent',
        label: 'text-black',
        indicator: 'text-black',
      },
    },
    size: {
      default: {
        container: 'h-14 px-8',
        label: 'text-base',
      },
      lg: {
        container: 'h-14 px-8',
        label: 'text-xl',
      },
      sm: {
        container: 'h-10 px-4',
        label: 'text-sm',
        indicator: 'h-2',
      },
      icon: { container: 'size-9' },
    },
    disabled: {
      true: {
        container: 'bg-neutral-300',
        label: 'text-neutral-600',
        indicator: 'text-neutral-400',
      },
    },
    fullWidth: {
      true: {
        container: '',
      },
      false: {
        container: 'self-center',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    disabled: false,
    fullWidth: true,
    size: 'default',
  },
});

type ButtonVariants = VariantProps<typeof button>;
interface Props extends ButtonVariants, Omit<PressableProps, 'disabled'> {
  label?: string;
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

export const Button = React.forwardRef<View, Props>(
  (
    {
      label: text,
      loading = false,
      variant = 'default',
      disabled = false,
      size = 'default',
      className = '',
      textClassName = '',
      ...props
    },
    ref
  ) => {
    const styles = React.useMemo(
      () => button({ variant, disabled, size }),
      [variant, disabled, size]
    );

    return (
      <Pressable
        disabled={disabled || loading}
        className={styles.container({ className })}
        {...props}
        ref={ref}
      >
        {props.children ? (
          props.children
        ) : (
          <>
            {loading ? (
              <ActivityIndicator size="small" className={styles.indicator()} />
            ) : (
              <Text className={styles.label({ className: textClassName })}>
                {text}
              </Text>
            )}
          </>
        )}
      </Pressable>
    );
  }
);
