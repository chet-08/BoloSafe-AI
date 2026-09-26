export const sectorDetectionConfig = {
  finance: {
    title: 'Financial Services',
    detectionTitle: 'Voice Fraud Interception',
    metrics: [
      {
        id: 'ai-risk',
        label: 'AI Voice Risk',
        icon: 'risk',
        tone: 'high',
      },
      {
        id: 'speaker',
        label: 'Speaker Verification',
        icon: 'speaker',
        tone: 'neutral',
      },
      {
        id: 'acoustic',
        label: 'Acoustic Authenticity',
        icon: 'authenticity',
        tone: 'high',
      },
      {
        id: 'composite',
        label: 'Composite Risk',
        icon: 'composite',
        tone: 'high',
      },
    ],
    contextTitle: 'Transaction Protection',
    decisionTitle: 'Protect the financial interaction',
  },

  retail: {
    title: 'Retail Security',
    detectionTitle: 'Customer Impersonation Detection',
    metrics: [
      {
        id: 'ai-risk',
        label: 'AI Voice Risk',
        icon: 'risk',
        tone: 'medium',
      },
      {
        id: 'speaker',
        label: 'Customer Voice Match',
        icon: 'speaker',
        tone: 'neutral',
      },
      {
        id: 'account',
        label: 'Account Impersonation',
        icon: 'authenticity',
        tone: 'medium',
      },
      {
        id: 'composite',
        label: 'Composite Risk',
        icon: 'composite',
        tone: 'medium',
      },
    ],
    contextTitle: 'Order & Account Protection',
    decisionTitle: 'Protect the customer workflow',
  },

  hospitality: {
    title: 'Hospitality Security',
    detectionTitle: 'Guest Identity Protection',
    metrics: [
      {
        id: 'ai-risk',
        label: 'AI Voice Risk',
        icon: 'risk',
        tone: 'medium',
      },
      {
        id: 'speaker',
        label: 'Guest Voice Match',
        icon: 'speaker',
        tone: 'neutral',
      },
      {
        id: 'guest',
        label: 'Guest Impersonation',
        icon: 'authenticity',
        tone: 'medium',
      },
      {
        id: 'composite',
        label: 'Composite Risk',
        icon: 'composite',
        tone: 'medium',
      },
    ],
    contextTitle: 'Reservation & Guest Protection',
    decisionTitle: 'Protect the guest workflow',
  },

  entertainment: {
    title: 'Entertainment Security',
    detectionTitle: 'Content Authenticity Detection',
    metrics: [
      {
        id: 'ai-risk',
        label: 'Voice Clone Probability',
        icon: 'risk',
        tone: 'high',
      },
      {
        id: 'speaker',
        label: 'Performer Match',
        icon: 'speaker',
        tone: 'neutral',
      },
      {
        id: 'authenticity',
        label: 'Content Authenticity',
        icon: 'authenticity',
        tone: 'high',
      },
      {
        id: 'composite',
        label: 'Composite Risk',
        icon: 'composite',
        tone: 'high',
      },
    ],
    contextTitle: 'Content & Provenance Protection',
    decisionTitle: 'Protect the content workflow',
  },
}

export default sectorDetectionConfig
