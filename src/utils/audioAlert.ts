// Web Audio API synthesizer for instant, zero-dependency audio notifications
let audioCtx: AudioContext | null = null;

export function playOrderChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // First harmonic tone (Crisp metallic luxury bell)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15); // D6
    gain1.gain.setValueAtTime(0.28, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.9);

    // Second shimmering chord tone
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.1); // E6
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.3); // A6
    gain2.gain.setValueAtTime(0.22, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 1.2);
  } catch (err) {
    console.warn('Audio alert could not play:', err);
  }
}

export function generateOrderMailtoUrl(order: any, ownerEmail: string): string {
  const subject = encodeURIComponent(`[SOLO STORE] New Order #${order.id} from ${order.customer.fullName} ($${order.total})`);
  
  const itemsText = order.items
    .map(
      (item: any, idx: number) =>
        `${idx + 1}. ${item.productName} [${item.selectedOption}] x${item.quantity} - $${item.totalPrice}`
    )
    .join('\n');

  const body = encodeURIComponent(
`SOLO MONOCHROME ORDER DISPATCH
--------------------------------------------------
Order ID: #${order.id}
Date: ${new Date(order.createdAt).toLocaleString()}
Status: ${order.status.toUpperCase()}
Total: $${order.total.toFixed(2)} (${order.paymentMethod})

CUSTOMER DETAILS:
Name: ${order.customer.fullName}
Email: ${order.customer.email}
Phone: ${order.customer.phone}

SHIPPING ADDRESS:
${order.shippingAddress.addressLine1}
${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '\n' : ''}${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}
${order.shippingAddress.country}
${order.shippingAddress.deliveryNotes ? 'Notes: ' + order.shippingAddress.deliveryNotes : ''}

ORDER ITEMS:
${itemsText}

FINANCIALS:
Subtotal: $${order.subtotal.toFixed(2)}
Shipping: ${order.shippingFee === 0 ? 'FREE' : '$' + order.shippingFee.toFixed(2)}
Total: $${order.total.toFixed(2)}
--------------------------------------------------
Dispatch generated automatically for ${ownerEmail}`
  );

  return `mailto:${ownerEmail}?subject=${subject}&body=${body}`;
}
