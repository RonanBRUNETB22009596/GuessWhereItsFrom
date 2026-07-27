import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export const Button = ({ title, variant = 'primary', isLoading, className = '', ...props }: ButtonProps) => {
  const baseStyle = "py-4 px-6 rounded-xl flex-row justify-center items-center active:opacity-80";
  
  const variants = {
    primary: "bg-primary shadow-sm",
    secondary: "bg-secondary shadow-sm",
    outline: "border-2 border-primary bg-transparent",
    ghost: "bg-transparent",
  };

  const textVariants = {
    primary: "text-white font-bold text-lg",
    secondary: "text-white font-bold text-lg",
    outline: "text-primary font-bold text-lg",
    ghost: "text-primary font-bold text-lg",
  };

  return (
    <TouchableOpacity 
      className={`${baseStyle} ${variants[variant]} ${className} ${props.disabled ? 'opacity-50' : ''}`}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#6C63FF' : '#FFF'} />
      ) : (
        <Text className={textVariants[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
