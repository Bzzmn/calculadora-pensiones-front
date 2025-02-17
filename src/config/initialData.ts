import { PensionFormData } from '../types/pension';

export const initialFormData: PensionFormData = {
  nombre: '',
  edad: {
    anos: 25,
    meses: 0
  },
  genero: '' as 'Masculino' | 'Femenino' | '',
  edadRetiro: 65,
  capitalIndividual: 0,
  salarioBruto: 0,
  pensionIdeal: 0,
  nivelEstudios: ''
}; 