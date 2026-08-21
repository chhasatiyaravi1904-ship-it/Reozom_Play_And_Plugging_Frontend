import api from './api'

export interface PublicState {
  id: string
  name: string
  code: string
}

export interface PublicCity {
  id: string
  name: string
}

/** Unauthenticated state/city lookups for the public registration form. */
export const fetchPublicStates = () => {
  return api.get<PublicState[]>('/public/states')
}

export const fetchPublicCities = (stateId: string) => {
  return api.get<PublicCity[]>('/public/cities', { params: { state_id: stateId } })
}
