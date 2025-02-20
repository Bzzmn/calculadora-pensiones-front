import { PensionFormData } from '../types/pension';
import React from 'react';

export const questions = [
  {
    title: "¿Cuál es tu nombre?",
    component: (
      formData: PensionFormData, 
      setFormData: React.Dispatch<React.SetStateAction<PensionFormData>>, 
      showValidation: boolean
    ) => (
      <div className="space-y-2">
        <input
          type="text"
          className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 
            focus:ring-indigo-500 text-base sm:text-lg p-2 border
            ${showValidation && !formData.nombre ? 'border-red-500' : 'border-gray-300'}`}
          value={formData.nombre}
          onChange={(e) => {
            const value = e.target.value;
            if (/^[A-Za-zÀ-ÿ\s]*$/.test(value)) {
              setFormData({ 
                ...formData, 
                nombre: value.replace(/^\w/, (c) => c.toUpperCase()) 
              });
            }
          }}
          placeholder="Ingresa tu nombre"
          required
        />
        {showValidation && !formData.nombre && (
          <p className="text-sm text-red-600">
            Por favor, ingresa tu nombre
          </p>
        )}
      </div>
    ),
    isValid: (formData: PensionFormData) => formData.nombre.length >= 2
  },
  {
    title: "¿Cuál es tu edad?",
    component: (formData: PensionFormData, setFormData: React.Dispatch<React.SetStateAction<PensionFormData>>, showValidation: boolean) => (
      <div className="h-[180px] sm:h-auto space-y-4 flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Años</label>
            <select
              className={`block w-full rounded-md shadow-sm focus:border-indigo-500 
                focus:ring-indigo-500 text-base sm:text-lg lg:text-base p-2 border bg-white
                ${showValidation && !formData.edad.anos ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.edad.anos}
              onChange={(e) => setFormData({
                ...formData,
                edad: { ...formData.edad, anos: parseInt(e.target.value) }
              })}
              required
            >
              <option value="">Selecciona los años</option>
              {Array.from({ length: 41 }, (_, i) => i + 25).map((year) => (
                <option key={year} value={year} className="text-base sm:text-lg lg:text-base">
                  {year} años
                </option>
              ))}
            </select>
            {showValidation && !formData.edad.anos && (
              <p className="mt-2 text-sm text-red-600">Por favor selecciona los años</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meses</label>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 
                focus:ring-indigo-500 text-base sm:text-lg lg:text-base p-2 border bg-white"
              value={formData.edad.meses}
              onChange={(e) => setFormData({
                ...formData,
                edad: { ...formData.edad, meses: parseInt(e.target.value) }
              })}
              required
            >
              <option value="" className="text-base sm:text-lg lg:text-base">Selecciona los meses</option>
              {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                <option key={month} value={month} className="text-base sm:text-lg lg:text-base">
                  {month} {month === 1 ? 'mes' : 'meses'}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Debes tener entre 25 y 65 años para usar esta herramienta
        </p>
      </div>
    ),
    isValid: (formData: PensionFormData) => {
      return formData.edad.anos >= 25 && 
             formData.edad.anos <= 65 && 
             formData.edad.meses >= 0 && 
             formData.edad.meses <= 11;
    }
  },
  {
    title: "¿Cuál es tu género?",
    component: (
      formData: PensionFormData, 
      setFormData: React.Dispatch<React.SetStateAction<PensionFormData>>,
      showValidation: boolean
    ) => (
      <div className="mt-1 space-y-4">
        {['Masculino', 'Femenino'].map((option) => (
          <label key={option} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              className="form-radio text-indigo-600 h-5 w-5"
              name="genero"
              value={option}
              checked={formData.genero === option}
              onChange={(e) => setFormData({ ...formData, genero: e.target.value as 'Masculino' | 'Femenino' })}
              required
            />
            <span className="ml-3 text-lg">{option}</span>
          </label>
        ))}
        {showValidation && !formData.genero && (
          <p className="text-sm text-red-600">
            Por favor, elige una opción
          </p>
        )}
      </div>
    ),
    isValid: (formData: PensionFormData) => formData.genero !== ''
  },
  {
    title: "¿A qué edad planeas retirarte?",
    component: (formData: PensionFormData, setFormData: React.Dispatch<React.SetStateAction<PensionFormData>>) => (
      <div className="mt-4">
        <input
          type="range"
          min="62"
          max="68"
          step="1"
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          value={formData.edadRetiro}
          onChange={(e) => setFormData({ ...formData, edadRetiro: parseInt(e.target.value) })}
        />
        <div className="text-center mt-4 text-2xl font-semibold text-indigo-600">
          {formData.edadRetiro} años
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>62 años</span>
          <span>68 años</span>
        </div>
      </div>
    ),
    isValid: () => true
  },
  {
    title: "¿Cuál es tu total acumulado en tu cuenta de capitalización individual?",
    component: (
      formData: PensionFormData, 
      setFormData: React.Dispatch<React.SetStateAction<PensionFormData>>,
      showValidation: boolean
    ) => (
      <div className="space-y-4">
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`block w-full pl-7 pr-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 
              focus:ring-indigo-500 text-base sm:text-lg p-2 border
              ${showValidation && !formData.capitalIndividual ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="0"
            value={formData.capitalIndividual ? formData.capitalIndividual.toLocaleString('es-CL') : ''}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 9) {
                setFormData({ 
                  ...formData, 
                  capitalIndividual: value ? parseInt(value) : 0 
                });
              }
            }}
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">CLP</span>
          </div>
        </div>

        {showValidation && !formData.capitalIndividual && (
          <p className="text-sm text-red-600">
            Debes indicar un monto
          </p>
        )}

        <p className="text-sm text-gray-600">
          Puedes consultar el saldo de tu cuenta de capitalización individual con tu Clave Única en la{' '}
          <a 
            href="https://www.spensiones.cl/apps/simuladorPensiones/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            Superintendencia de Pensiones
          </a>
        </p>
      </div>
    ),
    isValid: (formData: PensionFormData) => formData.capitalIndividual > 0 && 
                                          formData.capitalIndividual.toString().length <= 9
  },
  {
    title: "¿Cuál es tu salario bruto actual?",
    component: (
      formData: PensionFormData, 
      setFormData: React.Dispatch<React.SetStateAction<PensionFormData>>, 
      showValidation: boolean
    ) => (
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`block w-full pl-7 pr-12 rounded-md shadow-sm focus:border-indigo-500 
              focus:ring-indigo-500 text-base sm:text-lg p-2 border
              ${showValidation && !formData.salarioBruto ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="0"
            value={formData.salarioBruto ? formData.salarioBruto.toLocaleString('es-CL') : ''}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 7) {
                setFormData({ 
                  ...formData, 
                  salarioBruto: value ? parseInt(value) : 0 
                });
              }
            }}
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">CLP</span>
          </div>
        </div>
        {showValidation && !formData.salarioBruto && (
          <p className="text-sm text-red-600">
            Por favor, ingresa tu salario bruto actual
          </p>
        )}
      </div>
    ),
    isValid: (formData: PensionFormData) => formData.salarioBruto > 0
  },
  {
    title: "Si te retiraras hoy, ¿cuál sería tu monto ideal de pensión mensual?",
    component: (formData: PensionFormData, setFormData: React.Dispatch<React.SetStateAction<PensionFormData>>, showValidation: boolean) => (
      <div className="space-y-4">
        <div className="space-y-2">
          <ul className="list-disc pl-5 space-y-1">
            <li className="text-sm text-gray-600">
              Indica el monto mensual que consideras necesario para mantener tu calidad de vida actual.
            </li>
            <li className="text-sm text-gray-600">
              Te recomendamos ser lo más realista posible.
            </li>
          </ul>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            className={`block w-full pl-7 pr-12 rounded-md shadow-sm focus:border-indigo-500 
              focus:ring-indigo-500 text-base sm:text-lg p-2 border
              ${showValidation && !formData.pensionIdeal ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="0"
            value={formData.pensionIdeal ? formData.pensionIdeal.toLocaleString('es-CL') : ''}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 7) {
                setFormData({ 
                  ...formData, 
                  pensionIdeal: value ? parseInt(value) : 0 
                });
              }
            }}
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">CLP</span>
          </div>
        </div>
        {showValidation && !formData.pensionIdeal && (
          <p className="text-sm text-red-600">
            Debes ingresar un monto
          </p>
        )}
      </div>
    ),
    isValid: (formData: PensionFormData) => formData.pensionIdeal > 0 && 
                                          formData.pensionIdeal.toString().length <= 7
  },
  {
    title: "¿Cuál es tu nivel de estudios?",
    component: (formData: PensionFormData, setFormData: React.Dispatch<React.SetStateAction<PensionFormData>>, showValidation: boolean) => (
      <div className="space-y-4">
        <div className="mb-8 sm:mb-12">
          <label htmlFor="nivelEstudios" className="block text-sm font-medium text-gray-700 mb-3">
            Selecciona tu nivel de estudios
          </label>
          <select
            id="nivelEstudios"
            value={formData.nivelEstudios}
            onChange={(e) => setFormData({ ...formData, nivelEstudios: e.target.value })}
            className={`block w-full rounded-md shadow-sm focus:border-indigo-500 
              focus:ring-indigo-500 text-base sm:text-lg p-2 border bg-white
              ${showValidation && !formData.nivelEstudios ? 'border-red-500' : 'border-gray-300'}`}
            required
          >
            <option value="" className="text-base sm:text-lg">
              Selecciona una opción
            </option>
            {[
              'Postgrado',
              'Universitaria completa',
              'Universitaria incompleta',
              'Técnica',
              'Media',
              'Básica'
            ].map((level) => (
              <option key={level} value={level} className="text-base sm:text-lg">
                {level}
              </option>
            ))}
          </select>
          {showValidation && !formData.nivelEstudios && (
            <p className="mt-2 text-sm text-red-600">
              Debes elegir una opción
            </p>
          )}
        </div>
      </div>
    ),
    isValid: (formData: PensionFormData) => formData.nivelEstudios !== ''
  }
]; 