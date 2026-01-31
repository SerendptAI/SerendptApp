/* eslint-disable max-lines-per-function */
import { router } from 'expo-router';
import React from 'react';

import {
  Button,
  FocusAwareStatusBar,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { Check } from '@/components/ui/icons/check';
import { Close } from '@/components/ui/icons/close';
import { Uncheck } from '@/components/ui/icons/uncheck';

type Plan = {
  id: string;
  name: string;
  price: string;
  features: {
    text: string;
    included: boolean;
    comingSoon?: boolean;
  }[];
  buttonText: string;
  buttonStyle: 'current' | 'upgrade';
};

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    price: '$0/month',
    features: [
      { text: 'Word limit: 5,000 words/month', included: true },
      { text: 'Q&A prompts: 30 per month', included: true },
      { text: '1 basic voice', included: true },
      { text: 'Save and resume reading', included: false },
      { text: 'Leave notes: (Coming soon)', included: true, comingSoon: true },
      { text: 'Priority support', included: false },
    ],
    buttonText: 'You are currently using',
    buttonStyle: 'current',
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '$5/month',
    features: [
      { text: 'Word limit: 50,000 words/month', included: true },
      { text: 'Q&A prompts: 100 per month', included: true },
      {
        text: 'Multiple voices: (Coming soon)',
        included: true,
        comingSoon: true,
      },
      {
        text: 'Save and resume reading: (Coming soon)',
        included: true,
        comingSoon: true,
      },
      { text: 'Leave notes: (Coming soon)', included: true, comingSoon: true },
      { text: 'Priority support', included: true },
    ],
    buttonText: 'Upgrade to pro',
    buttonStyle: 'upgrade',
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: '$15/month',
    features: [
      { text: 'Word limit: 200,000 words/month', included: true },
      { text: 'Q&A prompts: 500 per month', included: true },
      {
        text: 'Multiple voices: (Coming soon)',
        included: true,
        comingSoon: true,
      },
      { text: 'Everything in pro', included: true },
      { text: 'Offline mode', included: true },
      { text: 'Early feature access', included: true },
    ],
    buttonText: 'Upgrade to premium',
    buttonStyle: 'upgrade',
  },
];

export default function Pricing(): JSX.Element {
  const handlePlanSelect = (planId: string) => {
    console.log('Selected plan:', planId);
    // Handle plan selection logic here
  };

  return (
    <View className="flex-1 bg-white">
      <FocusAwareStatusBar />
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-4">
            <View className="mb-4 flex-row justify-end">
              <TouchableOpacity onPress={() => router.back()}>
                <Close />
              </TouchableOpacity>
            </View>
            {/* Page Header */}
            <View className="items-center">
              <Text className="text-center font-brownstd text-[35px] text-black">
                Unlock more with {'\n'} premium
              </Text>
              <Text
                className="mt-5 px-4 text-center font-brownstd text-[14px] text-black"
                style={{ lineHeight: 20 }}
              >
                Listen to your documents seamlessly, {'\n'} like music — with
                more words,{'\n'} more answers, and more freedom.
              </Text>

              {/* Illustration */}
              <View className="items-center">
                <Image
                  source={require('../../../assets/birds.png')}
                  style={{ width: 216, height: 216 }}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Plan Cards */}
            <View className="space-y-4">
              {plans.map((plan) => (
                <View
                  key={plan.id}
                  className="mb-4 rounded-[20px] border border-black bg-white p-6"
                >
                  {/* Plan Header */}
                  <View className="mb-4">
                    <Text className="mb-2 text-[20px] font-brownstd-bold text-black">
                      {plan.name}
                    </Text>
                    <Text className="text-[18px] text-gray-600">
                      {plan.price}
                    </Text>
                  </View>

                  {/* Features List */}
                  <View className="mb-6">
                    {plan.features.map((feature, index) => (
                      <View key={index} className="mb-3 flex-row items-start">
                        <Text className="mr-3 text-[16px] font-brownstd">
                          {feature.included ? <Check /> : <Uncheck />}
                        </Text>
                        <Text className="flex-1 text-[16px] font-brownstd">
                          {feature.text}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Action Button */}
                  <Button
                    label={plan.buttonText}
                    className={`w-full rounded-2xl py-4 ${
                      plan.buttonStyle === 'current'
                        ? 'bg-black'
                        : 'bg-[#FFCC00]'
                    }`}
                    textClassName={`font-brownstd-bold text-lg ${
                      plan.buttonStyle === 'current'
                        ? 'text-white'
                        : 'text-black'
                    }`}
                    onPress={() => handlePlanSelect(plan.id)}
                  />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
