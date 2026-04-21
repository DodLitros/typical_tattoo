export interface ClientEntry {
  id: string;
  full_name: string;
  phone: string;
}

export interface QuoteFormValues {
  fullName: string;
  phone: string;
  // description: string;
}

export interface QuoteRequestPayload {
  full_name: string;
  phone: string;
  // description: string;
}

export interface NewClient {
  full_name: string;
  phone: string;
}