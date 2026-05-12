"use client"

import Link from "next/link"
import { motion, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { ArrowRight, PieChart, Users, Wallet, Shield, Zap, RefreshCw } from "lucide-react"

export default function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/icon.svg" alt="Circle Wallet Logo" className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight">Circle Wallet</span>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <div className="hidden sm:flex gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/sign-up">Sign up</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 overflow-hidden -z-10 h-full">
            <div className="absolute -top-40 left-1/2 w-[800px] h-[800px] -translate-x-1/2 opacity-20 dark:opacity-10 bg-primary/30 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-lighten" />
            <div className="absolute top-20 left-[20%] w-[600px] h-[600px] opacity-20 dark:opacity-10 bg-secondary/30 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-lighten" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 text-sm font-medium">
                <SparklesIcon className="w-4 h-4" />
                <span>The ultimate expense manager for group trips</span>
              </motion.div>
              
              <motion.h1 
                variants={itemVariants}
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight"
              >
                Fair splits. Zero drama. <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                  Perfect memories.
                </span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto"
              >
                Circle Wallet elegantly handles complex group expenses with weighted share ratios for adults, teens, and kids.
              </motion.p>
              
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto rounded-full" asChild>
                  <Link href="/auth/sign-up">
                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto rounded-full" asChild>
                  <Link href="/auth/login">Try Demo Account</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need for seamless group travel</h2>
              <p className="text-lg text-muted-foreground">
                Say goodbye to complex spreadsheets and awkward IOUs. We've built the smartest way to manage shared wallets.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto bg-card p-10 rounded-3xl border shadow-xl"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to simplify your next trip?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of families using Circle Wallet to keep their finances transparent and stress-free.
              </p>
              <Button size="lg" className="h-12 px-8 rounded-full" asChild>
                <Link href="/auth/sign-up">Create Your Shared Wallet</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <img src="/icon.svg" alt="Logo" className="w-6 h-6 grayscale opacity-50" />
            <span>© 2026 Circle Wallet. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  )
}

const features = [
  {
    title: "Weighted Splitting",
    description: "Assign ratios (e.g., Adults 1.0, Kids 0.5) to automatically calculate fair shares for every expense without doing the math yourself.",
    icon: <PieChart className="w-6 h-6" />,
  },
  {
    title: "Shared Wallet Balance",
    description: "Track total contributions and real-time balances for the entire group and individual families in one unified dashboard.",
    icon: <Wallet className="w-6 h-6" />,
  },
  {
    title: "Multi-Family Support",
    description: "Group members into family units. See which family is owed money and who needs to top up their contribution.",
    icon: <Users className="w-6 h-6" />,
  },
  {
    title: "Real-time Sync",
    description: "All expenses, payments, and balances update instantly across everyone's devices as soon as a transaction is logged.",
    icon: <RefreshCw className="w-6 h-6" />,
  },
  {
    title: "Approval Workflows",
    description: "Set thresholds for large payments that require co-admin approval before funds are deducted from the shared wallet.",
    icon: <Shield className="w-6 h-6" />,
  },
  {
    title: "Detailed Reports",
    description: "Generate comprehensive breakdowns by category, family, or individual member to settle up cleanly at the end of the trip.",
    icon: <Zap className="w-6 h-6" />,
  },
]
