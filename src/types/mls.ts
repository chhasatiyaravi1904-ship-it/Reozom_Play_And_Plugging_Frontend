export interface MlsInfoItem {
  id: number
  mlsDirectoryId: number
  title: string | null
  countries: string[]
  publicWebsitesTitle: string | null
  websites: string[]
  info: string | null
  createdAt?: string
  updatedAt?: string
}

export interface MlsDirectoryItem {
  id: number
  title: string
  infosCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface MlsDirectoryDetail extends MlsDirectoryItem {
  infos?: MlsInfoItem[]
}

export interface CreateMlsDirectoryPayload {
  title: string
}

export interface UpdateMlsDirectoryPayload extends Partial<CreateMlsDirectoryPayload> {}

export interface CreateMlsInfoPayload {
  mlsDirectoryId: number
  title?: string
  countries?: string[]
  publicWebsitesTitle?: string
  websites?: string[]
  info?: string
}

export interface UpdateMlsInfoPayload extends Partial<CreateMlsInfoPayload> {}

export interface PaginationMeta {
  currentPage?: number
  perPage?: number
  total?: number
  lastPage?: number
}

export interface MlsDirectoryListResponse {
  items?: MlsDirectoryItem[]
  data?: MlsDirectoryItem[]
  meta?: PaginationMeta
}

export interface MlsInfoListResponse {
  items?: MlsInfoItem[]
  data?: MlsInfoItem[]
  meta?: PaginationMeta
}
