// supabase/functions/create-order/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
    try {
        const { address_id, payment_method } = await req.json();

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!,
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        const { data: address, error: addressError } = await supabase
            .from('addresses')
            .select('house_no, street_address, landmark, city, state, postal_code, country')
            .eq('id', address_id)
            .single();

        if (addressError || !address) {
            throw new Error(`Selected address not found for ID: ${address_id}`);
        }

        const shippingAddressString = `${address.house_no}, ${address.street_address}, ${address.landmark ? `near ${address.landmark}, ` : ''}${address.city}, ${address.state} - ${address.postal_code}, ${address.country}`;

        const { data: cartItems, error: cartError } = await supabase
            .from('cart_items')
            .select('product_id, quantity, products(price)')
            .eq('user_id', user.id);

        if (cartError || !cartItems || !cartItems.length) {
            throw new Error("Your cart is empty.");
        }

        const subtotal = cartItems.reduce((sum, item) => sum + item.products.price * item.quantity, 0);
        const shippingFee = subtotal > 0 ? 50.00 : 0;
        const total_price = subtotal + shippingFee;

        const { data: newOrder, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                shipping_address: shippingAddressString,
                total_price: total_price,
                // FINAL FIX: Use the correct lowercase status from your enum
                status: 'processing'
            })
            .select()
            .single();

        if (orderError) throw orderError;

        const orderItems = cartItems.map((item) => ({
            order_id: newOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.products.price
        }));

        const { error: orderItemsError } = await supabase.from('order_items').insert(orderItems);
        if (orderItemsError) throw orderItemsError;

        const { error: deleteCartError } = await supabase.from('cart_items').delete().eq('user_id', user.id);
        if (deleteCartError) throw deleteCartError;

        return new Response(JSON.stringify({ orderId: newOrder.id }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error("Error in create-order function:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});