import React from 'react';
import { router } from 'expo-router';
import {
  FocusAwareStatusBar,
  Text,
  View,
  TouchableOpacity,
  Button,
  Image,
  ScrollView,
  SafeAreaView,
} from '@/components/ui';
import { Back } from '@/components/ui/icons/back';
import { Close } from '@/components/ui/icons/close';
import { Check } from '@/components/ui/icons/check';
import { Uncheck } from '@/components/ui/icons/uncheck';

type Plan = {
  id: string;
  name: string;
  price: string;
  features: Array<{
    text: string;
    included: boolean;
    comingSoon?: boolean;
  }>;
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
            <View className="flex-row justify-end mb-4">
              <TouchableOpacity onPress={() => router.back()}>
                <Close />
              </TouchableOpacity>
            </View>
            {/* Page Header */}
            <View className="items-center">
              <Text className="text-center text-[35px] font-garamond text-black">
                Unlock more with {'\n'} premium
              </Text>
               <Text className="text-center text-[14px] text-[#000000] px-4 mt-5" style={{ lineHeight: 20 }}>
                Listen to your documents seamlessly, {'\n'} like music — with more
                words,{'\n'} more answers, and more freedom.
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
                  className="bg-white border border-[#000000] rounded-[20px] p-6 mb-4"
                >
                  {/* Plan Header */}
                  <View className="mb-4">
                    <Text className="text-[20px] font-bold text-black mb-2">
                      {plan.name}
                    </Text>
                    <Text className="text-[18px] text-gray-600">
                      {plan.price}
                    </Text>
                  </View>

                  {/* Features List */}
                  <View className="mb-6">
                    {plan.features.map((feature, index) => (
                      <View key={index} className="flex-row items-start mb-3">
                        <Text className="text-[16px] mr-3">
                          {feature.included ? <Check /> : <Uncheck />}
                        </Text>
                        <Text className="text-[16px] flex-1">
                          {feature.text}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Action Button */}
                  <Button
                    label={plan.buttonText}
                    className={`rounded-2xl py-4 w-full ${
                      plan.buttonStyle === 'current'
                        ? 'bg-black'
                        : 'bg-[#FFCC00]'
                    }`}
                    textClassName={`font-semibold text-lg ${
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
