import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingBag, CreditCard, Truck, MapPin, AlertCircle, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AddressProvider, useAddress } from "@/context/AddressContext";
import OrderTracker from "@/components/order/OrderTracker";
import { Card, CardContent } from "@/components/ui/card";

type PaymentMethod = "card" | "upi" | "cod";

const CartContent = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addresses, addAddress, selectedAddress, selectAddress } = useAddress();
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    isDefault: false
  });

  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.18;
  const total = subtotal + deliveryFee + tax;

  const handleQuantityChange = (itemId: number, change: number) => {
    const item = items.find(item => item.id === itemId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        updateQuantity(itemId, newQuantity);
      }
    }
  };

  const handleRemoveItem = (itemId: number) => {
    removeFromCart(itemId);
    toast.success("Item removed from cart");
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress(newAddress);
    setShowAddressDialog(false);
    setNewAddress({
      name: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      isDefault: false
    });
  };

  const handlePayment = () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setShowPaymentDialog(true);
  };

  const handlePaymentComplete = () => {
    setPaymentComplete(true);
    clearCart();
  };

  if (paymentComplete) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
          <div className="space-x-4">
            <Button onClick={() => navigate("/my-orders")}>
              View Orders
            </Button>
            <Button variant="outline" onClick={() => navigate("/medicines")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
        </div>

        {showLoginAlert && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-yellow-800">
                Please <Link to="/login" className="font-semibold underline">login</Link> to place your order
              </p>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some medicines to your cart</p>
            <Button onClick={() => navigate("/medicines")}>
              Browse Medicines
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            {item.brandName && (
                              <p className="text-gray-600">{item.brandName}</p>
                            )}
                            <p className="text-gray-600">₹{item.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(item.id, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(item.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span>₹{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Delivery Address</Label>
                      {selectedAddress ? (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium">{selectedAddress.name}</p>
                          <p className="text-gray-600">{selectedAddress.street}</p>
                          <p className="text-gray-600">
                            {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                          </p>
                          <p className="text-gray-600">{selectedAddress.phone}</p>
                        </div>
                      ) : (
                        <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                              <MapPin className="h-4 w-4 mr-2" />
                              Add Delivery Address
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Address</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddAddress} className="space-y-4">
                              <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                  id="name"
                                  value={newAddress.name}
                                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                  id="phone"
                                  value={newAddress.phone}
                                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="street">Street Address</Label>
                                <Textarea
                                  id="street"
                                  value={newAddress.street}
                                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="city">City</Label>
                                  <Input
                                    id="city"
                                    value={newAddress.city}
                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="state">State</Label>
                                  <Input
                                    id="state"
                                    value={newAddress.state}
                                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                    required
                                  />
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="pincode">Pincode</Label>
                                <Input
                                  id="pincode"
                                  value={newAddress.pincode}
                                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="isDefault"
                                  checked={newAddress.isDefault}
                                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                />
                                <Label htmlFor="isDefault">Set as default address</Label>
                              </div>
                              <Button type="submit" className="w-full">
                                Save Address
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    <div>
                      <Label>Payment Method</Label>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                        className="mt-2 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cod" id="cod" />
                          <Label htmlFor="cod">Cash on Delivery</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="upi" id="upi" />
                          <Label htmlFor="upi">UPI</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card">Card Payment</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Button
                      className="w-full bg-medical-600 hover:bg-medical-700"
                      onClick={handlePayment}
                      disabled={!selectedAddress}
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {paymentMethod === "card" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "upi" && (
              <div>
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  placeholder="username@upi"
                />
              </div>
            )}

            <Button
              className="w-full bg-medical-600 hover:bg-medical-700"
              onClick={handlePaymentComplete}
            >
              Pay ₹{total.toFixed(2)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Cart = () => (
  <AddressProvider>
    <CartContent />
  </AddressProvider>
);

export default Cart;
