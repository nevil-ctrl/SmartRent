import React from 'react';
import { X, FileText, Download, DollarSign, Shield, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';

interface ListingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: any;
}

export const ListingDetailsModal: React.FC<ListingDetailsModalProps> = ({
  isOpen,
  onClose,
  listing
}) => {
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Property Rental Contract', 105, 20, { align: 'center' });
    
    // Contract details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    let y = 40;
    
    doc.text('PROPERTY DETAILS', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.text(`Title: ${listing.title}`, 20, y);
    y += 7;
    
    doc.text(`Description: ${listing.description}`, 20, y);
    y += 7;
    
    doc.text(`Listing ID: #${listing.listingId}`, 20, y);
    y += 7;
    
    doc.text(`Landlord: ${listing.landlord}`, 20, y);
    y += 15;
    
    doc.setFontSize(12);
    doc.text('PRICING', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.text(`Daily Rate: ${listing.pricePerDay} MATIC`, 20, y);
    y += 7;
    
    doc.text(`Security Deposit: ${listing.deposit} MATIC`, 20, y);
    y += 15;
    
    doc.setFontSize(12);
    doc.text('CONTRACT INFORMATION', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.text(`Status: ${listing.isActive ? 'Active' : 'Inactive'}`, 20, y);
    y += 7;
    
    doc.text(`Created: ${new Date(Number(listing.createdAt) * 1000).toLocaleDateString()}`, 20, y);
    y += 7;
    
    doc.text(`Updated: ${new Date(Number(listing.updatedAt) * 1000).toLocaleDateString()}`, 20, y);
    y += 15;
    
    doc.setFontSize(12);
    doc.text('BLOCKCHAIN DATA', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.text(`IPFS Hash: ${listing.ipfsHash}`, 20, y);
    y += 15;
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('This is a blockchain-verified rental contract from SmartRent platform', 105, 280, { align: 'center' });
    doc.text('For verification, check the transaction on Polygon blockchain', 105, 285, { align: 'center' });
    
    // Save the PDF
    doc.save(`listing-${listing.listingId}-contract.pdf`);
  };

  if (!isOpen || !listing) return null;

  return (
    <div className="modal-overlay" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="modal-content" style={{ maxWidth: '700px', animation: 'slideInUp 0.3s ease-out' }}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <FileText style={{ width: '24px', height: '24px' }} />
            Listing Details
          </h2>
          <button
            onClick={onClose}
            className="modal-close"
            type="button"
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {/* Property Info */}
          <div>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
              {listing.title}
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>
              {listing.description}
            </p>
            
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: listing.isActive ? 'var(--color-success-light, #d4edda)' : 'var(--color-danger-light, #f8d7da)',
              color: listing.isActive ? 'var(--color-success, #28a745)' : 'var(--color-danger, #dc3545)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600
            }}>
              {listing.isActive ? '✓ Active' : '✗ Inactive'}
            </div>
          </div>

          {/* Pricing Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--spacing-md)',
            backgroundColor: 'var(--color-background-secondary)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-sm)' }}>
              <DollarSign style={{ width: '20px', height: '20px', color: 'var(--color-primary)', marginTop: '4px' }} />
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Daily Rate</div>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, color: 'var(--color-primary)' }}>
                  {listing.pricePerDay} MATIC
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-sm)' }}>
              <Shield style={{ width: '20px', height: '20px', color: 'var(--color-warning)', marginTop: '4px' }} />
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Security Deposit</div>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, color: 'var(--color-warning)' }}>
                  {listing.deposit} MATIC
                </div>
              </div>
            </div>
          </div>

          {/* Contract Info */}
          <div style={{
            backgroundColor: 'var(--color-background-secondary)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-md)'
          }}>
            <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>
              📋 Contract Information
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Listing ID</div>
                <div style={{ fontWeight: 500, marginTop: '4px' }}>#{listing.listingId}</div>
              </div>

              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Landlord</div>
                <div style={{ fontWeight: 500, marginTop: '4px', fontSize: 'var(--font-size-sm)' }}>
                  {listing.landlord.slice(0, 6)}...{listing.landlord.slice(-4)}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-xs)' }}>
                <Calendar style={{ width: '16px', height: '16px', color: 'var(--color-text-muted)', marginTop: '4px' }} />
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Created</div>
                  <div style={{ fontWeight: 500, marginTop: '4px', fontSize: 'var(--font-size-sm)' }}>
                    {new Date(Number(listing.createdAt) * 1000).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-xs)' }}>
                <Calendar style={{ width: '16px', height: '16px', color: 'var(--color-text-muted)', marginTop: '4px' }} />
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Updated</div>
                  <div style={{ fontWeight: 500, marginTop: '4px', fontSize: 'var(--font-size-sm)' }}>
                    {new Date(Number(listing.updatedAt) * 1000).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>IPFS Hash</div>
              <code style={{
                fontSize: 'var(--font-size-xs)',
                backgroundColor: 'var(--color-background)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-md)',
                display: 'inline-block',
                wordBreak: 'break-all'
              }}>
                {listing.ipfsHash}
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
          <button
            onClick={exportToPDF}
            className="btn btn-primary"
          >
            <Download style={{ width: '20px', height: '20px' }} />
            <span>Export to PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

