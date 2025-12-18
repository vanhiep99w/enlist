import axios from 'axios';
import type { UserCredits, SpendCreditsRequest, SpendCreditsResponse } from '../types/user';

const API_BASE = 'http://localhost:8081/api';

export async function getUserCredits(userId: number): Promise<UserCredits> {
  const response = await axios.get<UserCredits>(`${API_BASE}/users/${userId}/credits`);
  return response.data;
}

export async function spendCredits(request: SpendCreditsRequest): Promise<SpendCreditsResponse> {
  const response = await axios.post<SpendCreditsResponse>(`${API_BASE}/users/credits/spend`, request);
  return response.data;
}
