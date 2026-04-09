export default function WarningCard({ warning }) {
  const { type, level, message } = warning;
  
  const getBorderColor = () => {
    if (level === 'error') return '#ef4444';
    if (level === 'info') return '#3b82f6';
    return '#f59e0b'; // warning
  };

  return (
    <div style={{
      borderLeft: `4px solid ${getBorderColor()}`,
      backgroundColor: '#f9fafb',
      padding: '12px 16px',
      margin: '8px 0',
      borderRadius: '4px',
      borderTop: '1px solid #e5e7eb',
      borderRight: '1px solid #e5e7eb',
      borderBottom: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: 'bold', 
          textTransform: 'uppercase', 
          color: getBorderColor(),
          padding: '2px 6px',
          backgroundColor: `${getBorderColor()}20`,
          borderRadius: '4px',
          marginRight: '8px'
        }}>
          {level}
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#4b5563' }}>
          {type}
        </span>
      </div>
      <p style={{ fontSize: '14px', margin: 0, color: '#1f2937' }}>
        {message}
      </p>
    </div>
  );
}
