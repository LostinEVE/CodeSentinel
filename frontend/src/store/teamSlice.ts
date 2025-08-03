import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'compliance_officer' | 'viewer';
  joinedAt: string;
  isActive: boolean;
  permissions: {
    canScan: boolean;
    canViewHistory: boolean;
    canManageTeam: boolean;
    canModifySettings: boolean;
  };
}

interface TeamState {
  members: TeamMember[];
  currentUser: TeamMember | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  members: [],
  currentUser: null,
  isLoading: false,
  error: null,
};

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<TeamMember>) => {
      state.currentUser = action.payload;
    },
    addTeamMember: (state, action: PayloadAction<TeamMember>) => {
      state.members.push(action.payload);
    },
    removeTeamMember: (state, action: PayloadAction<string>) => {
      state.members = state.members.filter(member => member.id !== action.payload);
    },
    updateTeamMember: (state, action: PayloadAction<TeamMember>) => {
      const index = state.members.findIndex(member => member.id === action.payload.id);
      if (index !== -1) {
        state.members[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCurrentUser,
  addTeamMember,
  removeTeamMember,
  updateTeamMember,
  setLoading,
  setError,
} = teamSlice.actions;

export default teamSlice.reducer;
