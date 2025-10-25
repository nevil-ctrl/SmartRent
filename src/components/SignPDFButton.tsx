import React from 'react';
import { jsPDF } from 'jspdf';
import { uploadFile, uploadJSON } from '../utils/ipfs';
import { useContracts } from '../hooks/useContracts';
import { useWeb3 } from '../hooks/useWeb3';

interface Props {
  rentalId: number;
  tenantName?: string;
  landlordName?: string;
}

export const SignPDFButton: React.FC<Props> = ({ rentalId, tenantName = 'Tenant', landlordName = 'Landlord' }) => {
  const { smartRent } = useContracts();
  const { signer } = useWeb3();

  const onSign = async () => {
    if (!signer) return alert('Connect wallet first');
    try {
      // Generate a very simple PDF
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text('Lease Agreement', 20, 20);
      doc.text(`Rental ID: ${rentalId}`, 20, 30);
      doc.text(`Tenant: ${tenantName}`, 20, 40);
      doc.text(`Landlord: ${landlordName}`, 20, 50);
      doc.text(`Date: ${new Date().toISOString()}`, 20, 60);

      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], `lease-${rentalId}.pdf`, { type: 'application/pdf' });

      // Upload to IPFS
      const cid = await uploadFile(file);
      const ipfsHash = cid;

      // Sign the ipfs hash with MetaMask (off-chain ECDSA signature)
      const signature = await signer.signMessage(ipfsHash);

      // Optionally save signature JSON on IPFS as evidence
      const sigRecord = { ipfsHash, signer: await signer.getAddress(), signature, timestamp: Date.now() };
      const sigCid = await uploadJSON(sigRecord);

      // Call contract signContract (on-chain flagging)
      if (!smartRent) throw new Error('Contract not loaded');
      const tx = await smartRent.signContract(rentalId, ipfsHash);
      await tx.wait();

      alert('Document uploaded to IPFS: ' + ipfsHash + '\nSignature recorded: ' + sigCid);
    } catch (e: any) {
      console.error(e);
      alert('Signing failed: ' + e.message);
    }
  };

  return (
    <button className="btn-primary" onClick={onSign}>Sign & Upload PDF</button>
  );
};

export default SignPDFButton;
