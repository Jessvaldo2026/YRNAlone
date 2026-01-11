// FILE: src/enterprise/EnterpriseContext.jsx
// ✅ COMPLETE FIXED VERSION - Exports what App.jsx expects
// 👨‍⚕️ Now includes Therapist role detection!

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const EnterpriseContext = createContext(null);

export const useEnterprise = () => {
  const context = useContext(EnterpriseContext);
  // Return safe defaults if no context
  if (!context) {
    return {
      organization: null,
      isEnterprise: false,
      isOrgAdmin: false,
      isTherapist: false,
      therapistId: null,
      therapistData: null,
      branding: null,
      loading: true
    };
  }
  return context;
};

export const EnterpriseProvider = ({ children }) => {
  const [organization, setOrganization] = useState(null);
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [isTherapist, setIsTherapist] = useState(false);
  const [therapistId, setTherapistId] = useState(null);
  const [therapistData, setTherapistData] = useState(null);
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setOrganization(null);
        setIsEnterprise(false);
        setIsOrgAdmin(false);
        setIsTherapist(false);
        setTherapistId(null);
        setTherapistData(null);
        setBranding(null);
        setLoading(false);
        return;
      }

      try {
        // Get user's data
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        if (userData?.organizationId) {
          const orgDoc = await getDoc(doc(db, 'organizations', userData.organizationId));
          const orgData = orgDoc.data();

          if (orgData) {
            setOrganization({
              id: userData.organizationId,
              ...orgData
            });
            setIsEnterprise(true);
            
            // Check if user is an org admin
            const isAdmin = userData.isOrgAdmin || 
                           (orgData.adminIds && orgData.adminIds.includes(user.uid)) ||
                           (orgData.adminId === user.uid);
            setIsOrgAdmin(isAdmin);
            
            // 👨‍⚕️ CHECK IF USER IS A THERAPIST
            // Look in organization's therapists subcollection
            try {
              const therapistsRef = collection(db, 'organizations', userData.organizationId, 'therapists');
              const therapistQuery = query(therapistsRef, where('userId', '==', user.uid));
              const therapistSnap = await getDocs(therapistQuery);
              
              if (!therapistSnap.empty) {
                const tData = therapistSnap.docs[0].data();
                setIsTherapist(true);
                setTherapistId(therapistSnap.docs[0].id);
                setTherapistData({
                  id: therapistSnap.docs[0].id,
                  ...tData
                });
                console.log('✅ User is a therapist:', tData.name);
              } else {
                // Also check by email in case userId wasn't set
                const emailQuery = query(therapistsRef, where('email', '==', user.email));
                const emailSnap = await getDocs(emailQuery);
                
                if (!emailSnap.empty) {
                  const tData = emailSnap.docs[0].data();
                  setIsTherapist(true);
                  setTherapistId(emailSnap.docs[0].id);
                  setTherapistData({
                    id: emailSnap.docs[0].id,
                    ...tData
                  });
                  console.log('✅ User is a therapist (by email):', tData.name);
                } else {
                  setIsTherapist(false);
                  setTherapistId(null);
                  setTherapistData(null);
                }
              }
            } catch (therapistErr) {
              console.log('Therapist check:', therapistErr.message);
              setIsTherapist(false);
            }
            
            setBranding({
              logo: orgData.logo || null,
              primaryColor: orgData.primaryColor || '#7C3AED',
              name: orgData.name,
              welcomeMessage: orgData.welcomeMessage || `Welcome to ${orgData.name}'s wellness program`
            });
          }
        } else {
          setOrganization(null);
          setIsEnterprise(false);
          setIsOrgAdmin(false);
          setIsTherapist(false);
          setTherapistId(null);
          setTherapistData(null);
          setBranding(null);
        }
      } catch (error) {
        console.error('Error checking enterprise status:', error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Export what App.jsx expects!
  const value = {
    organization,
    isEnterprise,
    isOrgAdmin,
    isTherapist,
    therapistId,
    therapistData,
    branding,
    loading
  };

  return (
    <EnterpriseContext.Provider value={value}>
      {children}
    </EnterpriseContext.Provider>
  );
};

export default EnterpriseContext;
