// supabase/functions/create-order/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
    try {
        // Added shipping_fee to the destructured parameters
        const { address_id, payment_method, shipping_fee } = await req.json();

        if (address_id == null || payment_method == null || shipping_fee == null) {
            throw new Error("Missing required parameters: address_id, payment_method, and shipping_fee.");
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!,
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        // Validate address exists (optional but good practice)
        const { data: address, error: addressError } = await supabase
            .from('addresses')
            .select('id') // Just select id to check existence
            .eq('id', address_id)
            .eq('user_id', user.id) // Ensure address belongs to user
            .maybeSingle(); // Use maybeSingle to handle null

        if (addressError || !address) {
            console.error("Address validation error:", addressError);
            throw new Error(`Selected address not found or doesn't belong to the user for ID: ${address_id}`);
        }

        // Fetch cart items
        const { data: cartItems, error: cartError } = await supabase
            .from('cart_items')
            .select('product_id, quantity, products(price)')
            .eq('user_id', user.id);

        if (cartError || !cartItems || !cartItems.length) {
            throw new Error("Your cart is empty.");
        }

        // Calculate subtotal from fetched cart items
        const subtotal = cartItems.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0);

        // Use the provided shipping_fee, ensure total_price is correct
        const total_price = subtotal + shipping_fee;

        // Insert the order
        const { data: newOrder, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                shipping_address: address_id, // Store the ID instead of the string
                total_price: total_price,
                status: 'processing', // Ensure lowercase matches enum/type
                payment_method: payment_method // Store the payment method used
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Prepare order items
        const orderItems = cartItems.map((item) => ({
            order_id: newOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.products?.price || 0 // Handle potentially missing price
        }));

        // Insert order items
        const { error: orderItemsError } = await supabase.from('order_items').insert(orderItems);
        if (orderItemsError) throw orderItemsError;

        // Clear cart
        const { error: deleteCartError } = await supabase.from('cart_items').delete().eq('user_id', user.id);
        if (deleteCartError) throw deleteCartError; // Consider if order should still succeed if cart clear fails

        return new Response(JSON.stringify({ orderId: newOrder.id }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error("Error in create-order function:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: error.message.includes('not found') ? 404 : 400, // Better status codes
        });
    }
});