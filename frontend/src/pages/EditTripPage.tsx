import { useParams } from 'react-router-dom';

const EditTripPage = () => {
  const { id } = useParams();
  return (
    <div className="page">
      <h1>Edit Trip {id}</h1>
      <p>Editing UI placeholder. Extend to save to backend.</p>
    </div>
  );
};

export default EditTripPage;

