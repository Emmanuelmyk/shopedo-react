import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import AdminLayout from "../../components/AdminLayout/AdminLayout";

const TestAuth = () => {
  const [session, setSession] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
  };

  const testInsert = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      console.log("🧪 Testing product insert...");
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session:", session ? "✅ Active" : "❌ None");
      console.log("User:", session?.user?.email);
      console.log("Access Token:", session?.access_token ? "✅ Present" : "❌ Missing");

      // Try to insert a test product
      const testProduct = {
        name: "Test Product",
        description: "This is a test",
        price: 100,
        category_id: 1,
        condition: "Brand New",
        location: "GRA",
        seller_name: "Test Seller",
        img_path: "test.jpg"
      };

      console.log("Attempting insert with data:", testProduct);

      const { data, error } = await supabase
        .from("products")
        .insert([testProduct])
        .select();

      if (error) {
        console.error("❌ Insert failed:", error);
        setTestResult({
          success: false,
          message: error.message,
          details: error
        });
      } else {
        console.log("✅ Insert successful:", data);
        setTestResult({
          success: true,
          message: "Product inserted successfully!",
          data: data
        });

        // Clean up - delete the test product
        if (data && data[0]) {
          await supabase.from("products").delete().eq("id", data[0].id);
          console.log("🧹 Test product cleaned up");
        }
      }
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      setTestResult({
        success: false,
        message: err.message,
        details: err
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container py-4">
        <h1>🧪 Authentication & RLS Test</h1>
        <p className="text-muted">Use this page to debug authentication and RLS issues</p>

        <div className="card mt-4">
          <div className="card-header">
            <h5>Session Information</h5>
          </div>
          <div className="card-body">
            {session ? (
              <div>
                <p><strong>✅ Authenticated</strong></p>
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>User ID:</strong> {session.user.id}</p>
                <p><strong>Access Token:</strong> {session.access_token ? "Present ✅" : "Missing ❌"}</p>
                <p><strong>Token Type:</strong> {session.token_type}</p>
              </div>
            ) : (
              <p className="text-danger">❌ No active session</p>
            )}
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-header">
            <h5>Test Product Insert</h5>
          </div>
          <div className="card-body">
            <p>Click the button below to test if you can insert a product (it will be automatically deleted after):</p>
            
            <button 
              className="btn btn-primary" 
              onClick={testInsert}
              disabled={loading || !session}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Testing...
                </>
              ) : (
                "🧪 Test Insert"
              )}
            </button>

            {testResult && (
              <div className={`alert mt-3 ${testResult.success ? "alert-success" : "alert-danger"}`}>
                <h6>{testResult.success ? "✅ Success" : "❌ Failed"}</h6>
                <p><strong>Message:</strong> {testResult.message}</p>
                {testResult.details && (
                  <details>
                    <summary>View Details</summary>
                    <pre className="mt-2">{JSON.stringify(testResult.details, null, 2)}</pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-header">
            <h5>📋 Troubleshooting Steps</h5>
          </div>
          <div className="card-body">
            <ol>
              <li>Make sure you're logged in (check session info above)</li>
              <li>Open browser console (F12) to see detailed logs</li>
              <li>Click "Test Insert" button</li>
              <li>If it fails with RLS error, run the SQL fix in Supabase</li>
              <li>Check the SQL Editor in Supabase Dashboard</li>
            </ol>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TestAuth;

