import api from './axiosConfig';


export interface CompanyData {
  app_name: string;
  app_description: string;

  //Desactivado por ahora hasta que se use
  /*company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_document: string;*/
}


export const getCompanyData = async (): Promise<CompanyData> => {
  const response = await api.get<{ success: boolean; data: Array<{ key: string; value: string }> }>('/settings');
  const arr = response.data.data;
  // Mapear array a objeto plano
  const obj: any = {};
  arr.forEach(item => {
    obj[item.key] = item.value;
  });
  return obj as CompanyData;
};


export const updateCompanyData = async (data: CompanyData): Promise<void> => {
  await api.post('settings/update-multiple', data);
};
