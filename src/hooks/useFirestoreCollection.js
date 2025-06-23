import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useLoading } from '../contexts/LoadingContext';
import { useSnackbar } from '../contexts/SnackbarContext';

const useFirestoreCollection = (collectionName, orderByField, orderDirection) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { showLoading, hideLoading } = useLoading();
  const { showSnackbar } = useSnackbar();

  // Flag para controlar si la primera carga ya se realizó
  const hasFetchedInitially = useRef(false);

  // La función para cargar todos los datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    showLoading('Cargando datos...');

    try {
      const collectionRef = collection(db, collectionName);
      const q = query(
        collectionRef,
        orderBy(orderByField, orderDirection)
      );

      const snapshot = await getDocs(q);
      const fetchedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setData(fetchedData);

    } catch (err) {
      console.error(`[useFirestoreCollection] ERROR al obtener ${collectionName}:`, err);
      setError(`Error al cargar ${collectionName}. Por favor, intenta de nuevo.`);
      showSnackbar(`Error al cargar ${collectionName}.`, 'error');
    } finally {
      setLoading(false);
      hideLoading();
    }
  }, [collectionName, orderByField, orderDirection, showLoading, hideLoading, showSnackbar, error]); // Dependencias de useCallback

  useEffect(() => {
    if (!hasFetchedInitially.current) {
      hasFetchedInitially.current = true; // Marca que ya se va a cargar
      fetchData();
    }
  }, [fetchData]); // Depende de fetchData

  // Función para refrescar los datos
  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refreshData
  };
};

export default useFirestoreCollection;