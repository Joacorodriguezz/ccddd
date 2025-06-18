import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Mail, Github, Chrome, Shield, Lock, Users } from "lucide-react"
import Link from "next/link"

export default function NewsletterSignup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 pt-8">
            {/* Brand Logo */}
            <div className="mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>

            {/* Headlines */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscribe to My Newsletter</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Get weekly insights, exclusive content, and the latest updates delivered straight to your inbox.
            </p>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            {/* Social Sign-up Options */}
            <div className="space-y-3">
              <Button variant="outline" className="w-full h-11 border-gray-200 hover:bg-gray-50 transition-colors">
                <Github className="w-5 h-5 mr-3" />
                Continue with GitHub
              </Button>
              <Button variant="outline" className="w-full h-11 border-gray-200 hover:bg-gray-50 transition-colors">
                <Chrome className="w-5 h-5 mr-3" />
                Continue with Google
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <Separator className="bg-gray-200" />
              <div className="absolute inset-0 flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-500 font-medium">OR CONTINUE WITH EMAIL</span>
              </div>
            </div>

            {/* Email Form */}
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Subscribe Now
              </Button>
            </form>

            {/* Additional Links */}
            <div className="flex justify-center space-x-6 text-xs">
              <Link href="/terms" className="text-gray-500 hover:text-purple-600 transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-500 hover:text-purple-600 transition-colors">
                Privacy
              </Link>
              <Link href="/help" className="text-gray-500 hover:text-purple-600 transition-colors">
                Help
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators Footer */}
        <div className="mt-6 text-center space-y-3">
          <div className="flex justify-center items-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>We respect your privacy</span>
            </div>
            <div className="flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Secure & encrypted</span>
            </div>
          </div>

          <div className="flex justify-center items-center space-x-1 text-xs text-gray-400">
            <Users className="w-3 h-3" />
            <span>Join 10,000+ subscribers</span>
          </div>

          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            No spam, ever. Unsubscribe at any time with one click.
          </p>
        </div>
      </div>
    </div>
  )
}
