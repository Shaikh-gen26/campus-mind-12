import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import StudentProfileView from "../../components/StudentProfileView";

export default function CourseAdminStudentDetail() {
  const { studentId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.courseAdmin.studentDetail(studentId).then(setData).catch((e) => setError(e.message));
  }, [studentId]);

  return (
    <div>
      <Link className="back-link" to="/course-admin/students">
        ← Back to students
      </Link>
      {error && <p className="error">{error}</p>}
      {data && (
        <>
          <div className="page-header">
            <h1>{data.fullName}</h1>
            <p>{data.studentId}</p>
          </div>
          <StudentProfileView data={data} />
        </>
      )}
    </div>
  );
}
