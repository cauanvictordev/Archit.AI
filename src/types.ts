export enum HouseStyle {
  MODERN = 'Moderno',
  CONTEMPORARY = 'Contemporâneo',
  MINIMALIST = 'Minimalista',
  CLASSIC = 'Clássico',
  RUSTIC = 'Rústico'
}

export interface GenerationRequest {
  style: HouseStyle;
  size: number;
  rooms: number;
  floors: number;
  additionalNotes?: string;
  inputImage?: string;
}

export interface GeneratedPlan {
  id: string;
  imageUrl: string;
  request: GenerationRequest;
  timestamp: number;
}

export interface Room {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}
