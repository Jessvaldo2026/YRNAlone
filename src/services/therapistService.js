// FILE: src/services/therapistService.js
// 👨‍⚕️ Therapist directory management for organizations

import { db } from '../firebase';
import { 
  collection, doc, setDoc, getDocs, updateDoc, 
  query, where, arrayUnion, arrayRemove 
} from 'firebase/firestore';

// Specialty options for therapists
export const SPECIALTIES = [
  'Anxiety',
  'Depression', 
  'Trauma & PTSD',
  'Grief & Loss',
  'Addiction Recovery',
  'Eating Disorders',
  'LGBTQ+ Support',
  'Family Therapy',
  'Child & Adolescent',
  'Couples Therapy',
  'Stress Management',
  'Anger Management',
  'OCD',
  'Bipolar Disorder',
  'Postpartum',
  'Career Counseling',
  'Life Transitions'
];

// Credential options
export const CREDENTIALS = [
  'PhD', 'PsyD', 'LMFT', 'LCSW', 'LPC', 
  'LCPC', 'NCC', 'CADC', 'MD', 'DO', 'RN', 'PMHNP'
];

// Get all therapists for organization
export const getOrgTherapists = async (organizationId) => {
  try {
    const therapistsRef = collection(db, 'organizations', organizationId, 'therapists');
    const snapshot = await getDocs(therapistsRef);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(t => t.isActive !== false);
  } catch (err) {
    console.error('Error fetching therapists:', err);
    return [];
  }
};

// Add a therapist to organization
export const addTherapist = async (organizationId, therapistData) => {
  const therapistId = `therapist_${Date.now()}`;
  
  const therapist = {
    id: therapistId,
    organizationId,
    name: therapistData.name,
    title: therapistData.title || 'Therapist',
    specialties: therapistData.specialties || [],
    bio: therapistData.bio || '',
    email: therapistData.email || '',
    phone: therapistData.phone || '',
    photo: therapistData.photo || '',
    availability: therapistData.availability || 'By appointment',
    acceptingNew: therapistData.acceptingNew !== false,
    languages: therapistData.languages || ['English'],
    credentials: therapistData.credentials || [],
    assignedMembers: [],
    createdAt: new Date().toISOString(),
    isActive: true
  };

  await setDoc(doc(db, 'organizations', organizationId, 'therapists', therapistId), therapist);
  
  return therapist;
};

// Update therapist
export const updateTherapist = async (organizationId, therapistId, updates) => {
  await updateDoc(
    doc(db, 'organizations', organizationId, 'therapists', therapistId),
    {
      ...updates,
      updatedAt: new Date().toISOString()
    }
  );
};

// Remove therapist (soft delete)
export const removeTherapist = async (organizationId, therapistId) => {
  await updateDoc(
    doc(db, 'organizations', organizationId, 'therapists', therapistId),
    { isActive: false, removedAt: new Date().toISOString() }
  );
};

// Assign therapist to member
export const assignTherapist = async (organizationId, memberId, therapistId) => {
  // Update user's assigned therapist
  await updateDoc(doc(db, 'users', memberId), {
    assignedTherapistId: therapistId,
    therapistAssignedAt: new Date().toISOString()
  });

  // Track assignment in therapist's record
  await updateDoc(
    doc(db, 'organizations', organizationId, 'therapists', therapistId),
    {
      assignedMembers: arrayUnion(memberId)
    }
  );
};

// Unassign therapist from member
export const unassignTherapist = async (organizationId, memberId, therapistId) => {
  await updateDoc(doc(db, 'users', memberId), {
    assignedTherapistId: null,
    therapistAssignedAt: null
  });

  await updateDoc(
    doc(db, 'organizations', organizationId, 'therapists', therapistId),
    {
      assignedMembers: arrayRemove(memberId)
    }
  );
};

// Get therapist's assigned members
export const getTherapistMembers = async (organizationId, therapistId) => {
  const membersQuery = query(
    collection(db, 'users'),
    where('organizationId', '==', organizationId),
    where('assignedTherapistId', '==', therapistId)
  );
  
  const snapshot = await getDocs(membersQuery);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    name: doc.data().name || doc.data().username,
    email: doc.data().email,
    assignedAt: doc.data().therapistAssignedAt
  }));
};