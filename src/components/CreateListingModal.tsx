import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { usePropertyImages } from '../hooks/useIPFS';
import { useContracts } from '../hooks/useContracts';
import { SuccessModal } from './SuccessModal';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { uploadPropertyImages, createPropertyMetadata, isUploading } = usePropertyImages();
  const { createListing } = useContracts();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pricePerDay: '',
    deposit: '',
    location: '',
    amenities: '',
    rules: '',
    specialConditions: ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdListing, setCreatedListing] = useState<any>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [canCancel, setCanCancel] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    setCanCancel(true);

    try {
      // Validate form
      if (!formData.title || !formData.description || !formData.pricePerDay || !formData.deposit) {
        throw new Error('Please fill in all required fields');
      }

      if (images.length === 0) {
        throw new Error('Please upload at least one image');
      }

      // Upload images to IPFS
      setLoadingMessage('Uploading images to IPFS...');
      const imageHashes = await uploadPropertyImages(images);

      // Create property metadata
      setLoadingMessage('Creating property metadata...');
      const metadata = await createPropertyMetadata({
        title: formData.title,
        description: formData.description,
        images: imageHashes,
        location: formData.location,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
        rules: formData.rules.split(',').map(r => r.trim()).filter(r => r)
      });

      // Create listing on blockchain
      setLoadingMessage('Creating listing on blockchain...');
      setCanCancel(false); // Can't cancel blockchain transaction
      try {
        await createListing(
          formData.title,
          formData.description,
          formData.pricePerDay,
          formData.deposit,
          metadata
        );
      } catch (error: any) {
        console.error('Contract error:', error);
        throw new Error('Failed to create listing on blockchain: ' + error.message);
      }

      // Save created listing data
      setCreatedListing({
        title: formData.title,
        description: formData.description,
        pricePerDay: formData.pricePerDay,
        deposit: formData.deposit
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        pricePerDay: '',
        deposit: '',
        location: '',
        amenities: '',
        rules: '',
        specialConditions: ''
      });
      setImages([]);

      // Show success modal
      setShowSuccess(true);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
      setLoadingMessage('');
      setCanCancel(true);
    }
  };

  const handleCancel = () => {
    if (isSubmitting && !canCancel) {
      // Can't cancel during blockchain transaction
      return;
    }
    
    // Reset all states
    setIsSubmitting(false);
    setLoadingMessage('');
    setError(null);
    setCanCancel(true);
    onClose();
  };

  if (!isOpen) return (
    <>
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Listing Created Successfully! 🎉"
        message="Your property listing has been created and deployed to the blockchain!"
        listingData={createdListing}
      />
    </>
  );

  return (
    <>
      <div className="modal-overlay">
      <div className="modal-content" style={{ position: 'relative' }}>
        
        {/* Loading Overlay */}
        {isSubmitting && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-xl)'
          }}>
            <div className="spinner" style={{ width: '48px', height: '48px' }} />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-lg)' }}>
                {loadingMessage || 'Processing...'}
              </h3>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                {canCancel ? 'This may take a few moments' : 'Please confirm transaction in MetaMask'}
              </p>
            </div>
            {canCancel && (
              <button
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            )}
            {!canCancel && (
              <p style={{ 
                margin: 0, 
                color: 'var(--color-warning)', 
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600
              }}>
                ⚠️ Cannot cancel blockchain transaction
              </p>
            )}
          </div>
        )}
        
      
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Create Property Listing</h2>
          <button
            onClick={handleCancel}
            className="modal-close"
            type="button"
            disabled={isSubmitting && !canCancel}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {error && (
              <div className="wallet-error">
                <AlertCircle style={{ width: '20px', height: '20px' }} />
                <span>{error}</span>
              </div>
            )}

            {/* Basic Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 0 }}>
                Basic Information
              </h3>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Property Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Modern Apartment in City Center"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Describe your property in detail..."
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Downtown, New York"
                />
              </div>
            </div>

            {/* Pricing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 0 }}>
                Pricing
              </h3>

              <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Daily Rate (MATIC) *</label>
                  <input
                    type="number"
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="0.1"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Security Deposit (MATIC) *</label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="1.0"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 0 }}>
                Property Images
              </h3>

              <div style={{
                border: '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-xl)',
                textAlign: 'center'
              }}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)'
                  }}
                >
                  <Upload style={{ width: '32px', height: '32px', color: 'var(--color-text-muted)' }} />
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    Click to upload images or drag and drop
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    PNG, JPG, GIF up to 10MB each
                  </span>
                </label>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-md)' }}>
                  {images.map((image, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '96px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-lg)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          backgroundColor: 'var(--color-danger)',
                          color: 'white',
                          borderRadius: 'var(--radius-full)',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--font-size-lg)',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 0 }}>
                Additional Information
              </h3>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Amenities (comma-separated)</label>
                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., WiFi, Parking, Pool, Gym"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">House Rules (comma-separated)</label>
                <input
                  type="text"
                  name="rules"
                  value={formData.rules}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., No smoking, No pets, Quiet hours after 10pm"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Special Conditions</label>
                <textarea
                  name="specialConditions"
                  value={formData.specialConditions}
                  onChange={handleInputChange}
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                  placeholder="Any special conditions or notes..."
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={isSubmitting && !canCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="btn btn-primary"
            >
              {isSubmitting || isUploading ? (
                <>
                  <div className="spinner spinner-sm" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <ImageIcon style={{ width: '20px', height: '20px' }} />
                  <span>Create Listing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Listing Created Successfully! 🎉"
        message="Your property listing has been created and deployed to the blockchain!"
        listingData={createdListing}
      />
    </>
  );
};
