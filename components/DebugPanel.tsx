'use client';

import { useState } from 'react';

/**
 * Debug Panel Component
 * =====================
 * Shows WordPress API data for debugging.
 * Only visible in development mode.
 * 
 * Usage:
 *   import DebugPanel from '@/components/DebugPanel';
 *   <DebugPanel data={page} />
 */

export default function DebugPanel({ data }: { data: any }) {
  const [isOpen, setIsOpen] = useState(false);

  // Hide in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 9999,
    }}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: isOpen ? '#dc2626' : '#0070f3',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isOpen ? '❌ Close Debug' : '🐛 Debug Data'}
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: 60,
          right: 0,
          width: '450px',
          maxHeight: '600px',
          overflow: 'auto',
          background: 'white',
          border: '2px solid #0070f3',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0', 
            fontSize: '18px',
            color: '#0070f3',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '10px',
          }}>
            🐛 WordPress API Debug
          </h3>
          
          {/* Page Info */}
          <div style={{ marginBottom: '15px' }}>
            <div style={infoRowStyle}>
              <strong>Page ID:</strong> 
              <span style={valueStyle}>{data?.id || 'N/A'}</span>
            </div>
            
            <div style={infoRowStyle}>
              <strong>Title:</strong> 
              <span style={valueStyle}>{data?.title?.rendered || 'N/A'}</span>
            </div>
            
            <div style={infoRowStyle}>
              <strong>Slug:</strong> 
              <span style={valueStyle}>{data?.slug || 'N/A'}</span>
            </div>
            
            <div style={infoRowStyle}>
              <strong>Status:</strong> 
              <span style={valueStyle}>{data?.status || 'N/A'}</span>
            </div>
            
            <div style={infoRowStyle}>
              <strong>Last Modified:</strong> 
              <span style={valueStyle}>
                {data?.modified ? new Date(data.modified).toLocaleString() : 'N/A'}
              </span>
            </div>
            
            <div style={infoRowStyle}>
              <strong>Fetched At:</strong> 
              <span style={valueStyle}>{new Date().toLocaleString()}</span>
            </div>
          </div>

          {/* ACF Status */}
          <div style={{
            background: data?.acf ? '#d1fae5' : '#fee2e2',
            border: `2px solid ${data?.acf ? '#10b981' : '#ef4444'}`,
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '15px',
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              {data?.acf ? '✅ ACF Data Present' : '❌ ACF Data Missing'}
            </div>
            
            {data?.acf ? (
              <>
                <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Fields Found:</strong> {Object.keys(data.acf).length}
                </div>
                <ul style={{ 
                  margin: '0', 
                  paddingLeft: '20px',
                  fontSize: '13px',
                }}>
                  {Object.keys(data.acf).map(key => (
                    <li key={key}>
                      <strong>{key}:</strong> {typeof data.acf[key]}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div style={{ fontSize: '13px' }}>
                Install "ACF to REST API" plugin in WordPress
              </div>
            )}
          </div>

          {/* ACF Data Preview */}
          {data?.acf && (
            <details style={{ marginBottom: '15px' }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: 'bold',
                padding: '8px',
                background: '#f3f4f6',
                borderRadius: '4px',
              }}>
                📦 ACF Data Preview
              </summary>
              <pre style={{
                background: '#f9fafb',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '11px',
                overflow: 'auto',
                maxHeight: '200px',
                marginTop: '8px',
                border: '1px solid #e5e7eb',
              }}>
                {JSON.stringify(data.acf, null, 2)}
              </pre>
            </details>
          )}

          {/* Full JSON Data */}
          <details>
            <summary style={{ 
              cursor: 'pointer', 
              fontWeight: 'bold',
              padding: '8px',
              background: '#f3f4f6',
              borderRadius: '4px',
            }}>
              📄 Full JSON Data
            </summary>
            <pre style={{
              background: '#f9fafb',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '11px',
              overflow: 'auto',
              maxHeight: '200px',
              marginTop: '8px',
              border: '1px solid #e5e7eb',
            }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>

          {/* Quick Actions */}
          <div style={{
            marginTop: '15px',
            padding: '12px',
            background: '#f3f4f6',
            borderRadius: '6px',
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>
              🔧 Quick Actions
            </div>
            <button
              onClick={() => {
                const url = `https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/${data?.id}?acf_format=standard`;
                window.open(url, '_blank');
              }}
              style={actionButtonStyle}
            >
              🌐 View API Response
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                alert('✅ JSON copied to clipboard!');
              }}
              style={actionButtonStyle}
            >
              📋 Copy JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const infoRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  borderBottom: '1px solid #f3f4f6',
  fontSize: '13px',
};

const valueStyle: React.CSSProperties = {
  color: '#6b7280',
  textAlign: 'right',
  maxWidth: '60%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const actionButtonStyle: React.CSSProperties = {
  background: '#0070f3',
  color: 'white',
  border: 'none',
  padding: '8px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  marginRight: '8px',
  marginBottom: '8px',
};
