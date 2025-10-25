import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import { ethers } from 'ethers';
import { useWeb3 } from './useWeb3';
import { useIPFS } from './useIPFS';

interface PDFState {
  isGenerating: boolean;
  isSigning: boolean;
  error: string | null;
}

interface PDFActions {
  generateRentalContract: (contractData: RentalContractData) => Promise<string>;
  signDocument: (message: string) => Promise<string>;
  verifySignature: (message: string, signature: string, address: string) => boolean;
  downloadPDF: (pdfBlob: Blob, filename: string) => void;
}

interface RentalContractData {
  rentalId: number;
  tenantAddress: string;
  landlordAddress: string;
  propertyTitle: string;
  propertyDescription: string;
  pricePerDay: string;
  totalRent: string;
  deposit: string;
  startDate: string;
  endDate: string;
  terms: string[];
  specialConditions: string[];
}

export const usePDF = (): PDFState & PDFActions => {
  const { signer } = useWeb3();
  const { uploadFile, getFileURL } = useIPFS();
  const [state, setState] = useState<PDFState>({
    isGenerating: false,
    isSigning: false,
    error: null,
  });

  const generateRentalContract = useCallback(async (contractData: RentalContractData): Promise<string> => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('RENTAL AGREEMENT', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Contract ID
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Contract ID: #${contractData.rentalId}`, 20, yPosition);
      yPosition += 15;

      // Date
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 20;

      // Parties
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PARTIES', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Landlord: ${contractData.landlordAddress}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Tenant: ${contractData.tenantAddress}`, 20, yPosition);
      yPosition += 15;

      // Property Details
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PROPERTY DETAILS', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Title: ${contractData.propertyTitle}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Description: ${contractData.propertyDescription}`, 20, yPosition);
      yPosition += 15;

      // Financial Terms
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('FINANCIAL TERMS', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Daily Rate: ${contractData.pricePerDay} MATIC`, 20, yPosition);
      yPosition += 8;
      doc.text(`Total Rent: ${contractData.totalRent} MATIC`, 20, yPosition);
      yPosition += 8;
      doc.text(`Security Deposit: ${contractData.deposit} MATIC`, 20, yPosition);
      yPosition += 15;

      // Rental Period
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RENTAL PERIOD', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Start Date: ${contractData.startDate}`, 20, yPosition);
      yPosition += 8;
      doc.text(`End Date: ${contractData.endDate}`, 20, yPosition);
      yPosition += 15;

      // Terms and Conditions
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TERMS AND CONDITIONS', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      contractData.terms.forEach((term, index) => {
        doc.text(`${index + 1}. ${term}`, 20, yPosition);
        yPosition += 8;
      });

      // Special Conditions
      if (contractData.specialConditions.length > 0) {
        yPosition += 10;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SPECIAL CONDITIONS', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        contractData.specialConditions.forEach((condition, index) => {
          doc.text(`${index + 1}. ${condition}`, 20, yPosition);
          yPosition += 8;
        });
      }

      // Signature Section
      yPosition += 20;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SIGNATURES', 20, yPosition);
      yPosition += 20;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Landlord Signature:', 20, yPosition);
      doc.text('_________________________', 20, yPosition + 20);
      doc.text('Date: _______________', 20, yPosition + 35);

      doc.text('Tenant Signature:', pageWidth - 100, yPosition);
      doc.text('_________________________', pageWidth - 100, yPosition + 20);
      doc.text('Date: _______________', pageWidth - 100, yPosition + 35);

      // Footer
      doc.setFontSize(10);
      doc.text('This contract is governed by SmartRent platform and blockchain technology.', pageWidth / 2, pageHeight - 20, { align: 'center' });

      // Convert to blob
      const pdfBlob = doc.output('blob');
      
      // Upload to IPFS
      const file = new File([pdfBlob], `rental-contract-${contractData.rentalId}.pdf`, { type: 'application/pdf' });
      const ipfsHash = await uploadFile(file);
      
      setState(prev => ({ ...prev, isGenerating: false }));
      return ipfsHash;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: error.message || 'Failed to generate PDF contract' 
      }));
      throw error;
    }
  }, [uploadFile]);

  const signDocument = useCallback(async (message: string): Promise<string> => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    setState(prev => ({ ...prev, isSigning: true, error: null }));

    try {
      // Create a message hash for signing
      const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));
      const signature = await signer.signMessage(ethers.getBytes(messageHash));
      
      setState(prev => ({ ...prev, isSigning: false }));
      return signature;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isSigning: false, 
        error: error.message || 'Failed to sign document' 
      }));
      throw error;
    }
  }, [signer]);

  const verifySignature = useCallback((message: string, signature: string, address: string): boolean => {
    try {
      const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message));
      const recoveredAddress = ethers.verifyMessage(ethers.getBytes(messageHash), signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }, []);

  const downloadPDF = useCallback((pdfBlob: Blob, filename: string) => {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return {
    ...state,
    generateRentalContract,
    signDocument,
    verifySignature,
    downloadPDF,
  };
};

// Utility hook for contract management
export const useContractSigning = () => {
  const pdf = usePDF();
  const { uploadJSON } = useIPFS();

  const createSignedContract = useCallback(async (contractData: RentalContractData & {
    tenantSignature?: string;
    landlordSignature?: string;
  }): Promise<string> => {
    // Generate PDF
    const pdfHash = await pdf.generateRentalContract(contractData);
    
    // Create contract metadata with signatures
    const contractMetadata = {
      ...contractData,
      pdfHash,
      signatures: {
        tenant: contractData.tenantSignature || '',
        landlord: contractData.landlordSignature || '',
      },
      createdAt: new Date().toISOString(),
      version: '1.0',
    };
    
    // Upload metadata to IPFS
    const metadataHash = await uploadJSON(contractMetadata);
    
    return metadataHash;
  }, [pdf, uploadJSON]);

  const signContractAsTenant = useCallback(async (contractData: RentalContractData): Promise<string> => {
    const message = `I, ${contractData.tenantAddress}, agree to the rental terms for property ${contractData.propertyTitle} (Contract #${contractData.rentalId})`;
    const signature = await pdf.signDocument(message);
    
    return await createSignedContract({
      ...contractData,
      tenantSignature: signature,
    });
  }, [pdf, createSignedContract]);

  const signContractAsLandlord = useCallback(async (contractData: RentalContractData): Promise<string> => {
    const message = `I, ${contractData.landlordAddress}, agree to rent out property ${contractData.propertyTitle} to ${contractData.tenantAddress} (Contract #${contractData.rentalId})`;
    const signature = await pdf.signDocument(message);
    
    return await createSignedContract({
      ...contractData,
      landlordSignature: signature,
    });
  }, [pdf, createSignedContract]);

  return {
    ...pdf,
    createSignedContract,
    signContractAsTenant,
    signContractAsLandlord,
  };
};
