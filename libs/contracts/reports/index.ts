import { ReportStatus } from '@app/common';
export interface GeoPoint {
  type: 'Point';
  coordinates: [longitude: number, latitude: number];
}
export interface ReportSummary {
  id: string;
  title: string;
  categoryId: string;
  citizenId: string;
  status: ReportStatus;
  location: GeoPoint;
}
