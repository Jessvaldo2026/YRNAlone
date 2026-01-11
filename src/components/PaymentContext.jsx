// FILE: src/payments/PaymentContext.jsx
// Complete payment management for individuals AND organizations

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const PaymentContext = createContext(null);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    return {
      subscription: null,
      isLoading: true,
      isPaid: false,
      isPastDue: false,
      daysUntilPayment: null
    };
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = null;

    const loadSubscription = async () => {
      if (!auth.currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        // Listen to user's subscription in real-time
        unsubscribe = onSnapshot(
          doc(db, 'subscriptions', auth.currentUser.uid),
          (doc) => {
            if (doc.exists()) {
              setSubscription({ id: doc.id, ...doc.data() });
            } else {
              setSubscription(null);
            }
            setIsLoading(false);
          },
          (error) => {
            console.error('Subscription listener error:', error);
            setIsLoading(false);
          }
        );
      } catch (error) {
        console.error('Error loading subscription:', error);
        setIsLoading(false);
      }
    };

    loadSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Check if subscription is active
  const isPaid = subscription?.status === 'active' || subscription?.status === 'trialing';
  
  // Check if payment is past due
  const isPastDue = subscription?.status === 'past_due';
  
  // Check if cancelled but still active
  const isCancelled = subscription?.cancelAtPeriodEnd === true;

  // Calculate days until next payment
  const daysUntilPayment = subscription?.currentPeriodEnd 
    ? Math.ceil((new Date(subscription.currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!subscription?.id) return { success: false };
    
    try {
      await updateDoc(doc(db, 'subscriptions', subscription.id), {
        cancelAtPeriodEnd: true,
        cancelledAt: new Date().toISOString()
      });
      
      // Send cancellation email (using individual payment template for now)
      if (window.emailjs) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const userData = userDoc.data();
        await window.emailjs.send('service_0i2gmim', 'template_iisxmgu', {
          to_email: userData.email,
          to_name: userData.name || 'Friend',
          plan_name: 'Subscription Cancelled',
          amount: '$0.00',
          next_billing_date: new Date(subscription.currentPeriodEnd).toLocaleDateString(),
          app_name: 'YRNAlone'
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Cancel error:', error);
      return { success: false, error: error.message };
    }
  };

  // Reactivate subscription
  const reactivateSubscription = async () => {
    if (!subscription?.id) return { success: false };
    
    try {
      await updateDoc(doc(db, 'subscriptions', subscription.id), {
        cancelAtPeriodEnd: false,
        cancelledAt: null
      });
      
      // Send reactivation email (using individual payment template)
      if (window.emailjs) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const userData = userDoc.data();
        await window.emailjs.send('service_0i2gmim', 'template_iisxmgu', {
          to_email: userData.email,
          to_name: userData.name || 'Friend',
          plan_name: 'Subscription Reactivated',
          amount: subscription.amount || '$5.99',
          next_billing_date: new Date(subscription.currentPeriodEnd).toLocaleDateString(),
          app_name: 'YRNAlone'
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Reactivate error:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <PaymentContext.Provider value={{
      subscription,
      isLoading,
      isPaid,
      isPastDue,
      isCancelled,
      daysUntilPayment,
      cancelSubscription,
      reactivateSubscription
    }}>
      {children}
    </PaymentContext.Provider>
  );
};

export default PaymentContext;
