import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Server, 
  Shield,
  CheckCircle,
  Star,
  Crown,
  Zap,
  Users,
  Clock,
  BarChart3,
  AlertTriangle,
  Eye,
  RefreshCw,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing: 'monthly' | 'yearly';
  description: string;
  features: string[];
  honeypotTypes: string[];
  maxHoneypots: number;
  supportLevel: string;
  analytics: boolean;
  customization: boolean;
  apiAccess: boolean;
  badge?: string;
  popular?: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    billing: 'monthly',
    description: 'Perfect for small businesses getting started with honeypot security',
    features: [
      'Up to 3 honeypot instances',
      'Basic SSH & HTTP honeypots',
      'Real-time monitoring',
      'Email alerts',
      'Basic reporting',
      'Community support'
    ],
    honeypotTypes: ['SSH', 'HTTP', 'Telnet'],
    maxHoneypots: 3,
    supportLevel: 'Community',
    analytics: true,
    customization: false,
    apiAccess: false
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    billing: 'monthly',
    description: 'Advanced protection for growing organizations',
    features: [
      'Up to 15 honeypot instances',
      'All honeypot types included',
      'Advanced threat analytics',
      'Custom alert configurations',
      'Detailed forensic reports',
      'Priority support',
      'API access',
      'Custom honeypot configurations'
    ],
    honeypotTypes: ['SSH', 'HTTP', 'Telnet', 'FTP', 'SMTP', 'MySQL', 'RDP'],
    maxHoneypots: 15,
    supportLevel: 'Priority',
    analytics: true,
    customization: true,
    apiAccess: true,
    badge: 'Most Popular',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    billing: 'monthly',
    description: 'Complete security solution for large organizations',
    features: [
      'Unlimited honeypot instances',
      'All honeypot types + custom',
      'AI-powered threat detection',
      'Real-time threat intelligence',
      'Advanced behavioral analysis',
      'Dedicated security engineer',
      'Custom integrations',
      'On-premise deployment option',
      'Compliance reporting',
      'White-label options'
    ],
    honeypotTypes: ['All Standard Types', 'Custom Protocols', 'IoT Devices', 'Database Systems'],
    maxHoneypots: -1, // Unlimited
    supportLevel: 'Dedicated Engineer',
    analytics: true,
    customization: true,
    apiAccess: true,
    badge: 'Best Value'
  }
];

export function HoneypotManager() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate checking current subscription
    setCurrentSubscription('starter'); // This would come from your subscription service
  }, []);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    setLoading(true);
    try {
      // Here you would integrate with your payment processor
      // For now, we'll simulate the subscription process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentSubscription(plan.id);
      toast({
        title: "Subscription Updated",
        description: `Successfully subscribed to ${plan.name} plan`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter': return <Shield className="h-6 w-8" />;
      case 'professional': return <Star className="h-6 w-6" />;
      case 'enterprise': return <Crown className="h-6 w-6" />;
      default: return <Server className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Honeypot Security Services</h2>
          <p className="text-muted-foreground">Choose the perfect security plan for your organization</p>
        </div>
        {currentSubscription && (
          <Badge variant="secondary" className="text-sm">
            Current Plan: {subscriptionPlans.find(p => p.id === currentSubscription)?.name}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="compare">Feature Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative transition-all hover:shadow-lg ${
                  plan.popular ? 'ring-2 ring-primary shadow-lg' : ''
                } ${currentSubscription === plan.id ? 'bg-accent/20' : ''}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className={plan.popular ? 'bg-primary' : 'bg-secondary'}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {getPlanIcon(plan.id)}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </div>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold">
                      ${plan.price}
                      <span className="text-lg text-muted-foreground font-normal">/{plan.billing}</span>
                    </div>
                    {plan.billing === 'yearly' && (
                      <p className="text-sm text-secondary">Save 20% with annual billing</p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Key Features
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      Honeypot Types
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {plan.honeypotTypes.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Max Honeypots:</span>
                      <p className="text-muted-foreground">
                        {plan.maxHoneypots === -1 ? 'Unlimited' : plan.maxHoneypots}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Support:</span>
                      <p className="text-muted-foreground">{plan.supportLevel}</p>
                    </div>
                    <div>
                      <span className="font-medium">Analytics:</span>
                      <p className="text-muted-foreground">
                        {plan.analytics ? <Check className="h-4 w-4 text-secondary" /> : '❌'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">API Access:</span>
                      <p className="text-muted-foreground">
                        {plan.apiAccess ? <Check className="h-4 w-4 text-secondary" /> : '❌'}
                      </p>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={loading || currentSubscription === plan.id}
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : currentSubscription === plan.id ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    {currentSubscription === plan.id ? 'Current Plan' : 'Choose Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Need a Custom Solution?</h3>
              <p className="text-muted-foreground">
                For organizations with unique requirements, we offer custom enterprise solutions 
                with dedicated infrastructure, specialized integrations, and tailored security protocols.
              </p>
              <Button variant="outline" className="mt-4">
                <Users className="h-4 w-4 mr-2" />
                Contact Sales Team
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="compare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature & Price Comparison</CardTitle>
              <CardDescription>Compare all features across our subscription plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Feature</th>
                      {subscriptionPlans.map(plan => (
                        <th key={plan.id} className="text-center py-2 min-w-32">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr className="border-b">
                      <td className="py-3 font-medium">Max Honeypots</td>
                      {subscriptionPlans.map(plan => (
                        <td key={plan.id} className="text-center py-3">
                          {plan.maxHoneypots === -1 ? 'Unlimited' : plan.maxHoneypots}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium">Real-time Monitoring</td>
                      {subscriptionPlans.map(plan => (
                        <td key={plan.id} className="text-center py-3">
                          <Check className="h-4 w-4 text-secondary mx-auto" />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium">Advanced Analytics</td>
                      {subscriptionPlans.map(plan => (
                        <td key={plan.id} className="text-center py-3">
                          {plan.analytics ? <Check className="h-4 w-4 text-secondary mx-auto" /> : '❌'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium">Custom Configurations</td>
                      {subscriptionPlans.map(plan => (
                        <td key={plan.id} className="text-center py-3">
                          {plan.customization ? <Check className="h-4 w-4 text-secondary mx-auto" /> : '❌'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium">API Access</td>
                      {subscriptionPlans.map(plan => (
                        <td key={plan.id} className="text-center py-3">
                          {plan.apiAccess ? <Check className="h-4 w-4 text-secondary mx-auto" /> : '❌'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium">Support Level</td>
                      {subscriptionPlans.map(plan => (
                        <td key={plan.id} className="text-center py-3 text-sm">
                          {plan.supportLevel}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}