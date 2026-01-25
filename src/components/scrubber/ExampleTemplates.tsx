'use client';

/**
 * ExampleTemplates Component
 * 
 * Provides quick example templates for users to try the scrubber
 * Uses a dropdown/popover for compact mobile display
 */

import { Button } from '@/components/ui/button';
import { FileText, Sparkles, MessageSquare, User, DollarSign, Heart } from 'lucide-react';
import { useScrubberStore } from '@/store/useSecretStore';
import { useToast } from '@/hooks/use-toast';
import { haptic } from '@/lib/haptics';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const EXAMPLE_TEMPLATES = [
  {
    id: 'customer-support',
    name: 'Customer Support',
    icon: MessageSquare,
    emoji: '💬',
    gradient: 'from-blue-500 to-cyan-500',
    content: `Customer Support Ticket #12345

Customer: John Smith
Email: john.smith@techcorp.com
Phone: (555) 123-4567
Account: Premium Business

Issue: Unable to process payment
Payment Method: Card ending in 4532 (Full: 4532-1234-5678-9010)
SSN (for verification): 123-45-6789

Please expedite resolution.`,
  },
  {
    id: 'employee-record',
    name: 'Employee Record',
    icon: User,
    emoji: '👤',
    gradient: 'from-purple-500 to-pink-500',
    content: `EMPLOYEE CONFIDENTIAL RECORD

Name: Sarah Johnson
Email: sarah.johnson@company.com
Personal Email: sarahj@gmail.com
Mobile: +1-555-987-6543
SSN: 987-65-4321
Emergency Contact: (555) 246-8135

Credit Card on File: 5555-5555-5555-4444
Department: Engineering
Clearance: Level 4`,
  },
  {
    id: 'financial-report',
    name: 'Financial Data',
    icon: DollarSign,
    emoji: '💰',
    gradient: 'from-green-500 to-emerald-500',
    content: `Q4 FINANCIAL SUMMARY

Client: michael.chen@startup.io
Transaction #: TRX-2025-001
Amount: $125,000.00

Payment Cards:
- Primary: 3782-822463-10005
- Backup: 6011-1111-1111-1117

Contact: +1 (555) 789-0123
Tax ID: 456-78-9012

Status: APPROVED`,
  },
  {
    id: 'medical-record',
    name: 'Medical Info',
    icon: Heart,
    emoji: '🏥',
    gradient: 'from-red-500 to-orange-500',
    content: `PATIENT MEDICAL RECORD

Patient: Dr. Emily Watson
DOB: 05/15/1985
SSN: 234-56-7890
Contact: emily.watson@healthmail.com
Phone: (555) 321-9876

Insurance Card: 4111-1111-1111-1111
Member ID: MED-789012

Emergency: +1-555-456-7890
Notes: Annual checkup scheduled`,
  },
];

export function ExampleTemplates() {
  const { setRawInput, clearAll } = useScrubberStore();
  const { toast } = useToast();

  const handleLoadExample = (template: typeof EXAMPLE_TEMPLATES[0]) => {
    clearAll(); // Clear any existing data
    setRawInput(template.content);
    haptic('success');
    toast({
      title: '✅ Example loaded',
      description: `${template.name} template loaded. Click "Scrub PII" to sanitize.`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 h-8 text-xs bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 hover:border-blue-500/40"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          <span className="hidden sm:inline">Examples</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-slate-500">
          Load Sample Data
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {EXAMPLE_TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <DropdownMenuItem 
              key={template.id}
              onClick={() => handleLoadExample(template)}
              className="h-10 gap-3 cursor-pointer"
            >
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${template.gradient} flex items-center justify-center`}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-medium">{template.name}</span>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <div className="px-2 py-2 text-[10px] text-slate-500 flex items-center gap-1.5">
          <FileText className="h-3 w-3" />
          <span>Data never leaves your browser</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
