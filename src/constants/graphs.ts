export interface GraphData {
  labels?: Array<string>;
  datasets: Array<Dataset>;
}

export interface Dataset {
  label: string;
  data: Array<{ x: string; y: number }>;
  fill: boolean;
  borderColor: string;
  tension: number;
}
