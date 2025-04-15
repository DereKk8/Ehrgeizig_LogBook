import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] p-4">
      <div className="w-full max-w-md rounded-lg bg-[#1e1e1e] p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-[#b3b3b3]">Sign up to start your fitness journey</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-white">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full rounded-md border border-[#404040] bg-[#2d2d2d] px-4 py-2 text-white placeholder-[#666666] focus:border-[#FF5733] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f]/50"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-md border border-[#404040] bg-[#2d2d2d] px-4 py-2 text-white placeholder-[#666666] focus:border-[#FF5733] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f]/50"
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-md border border-[#404040] bg-[#2d2d2d] px-4 py-2 text-white placeholder-[#666666] focus:border-[#FF5733] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f]/50"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-white">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              className="w-full rounded-md border border-[#404040] bg-[#2d2d2d] px-4 py-2 text-white placeholder-[#666666] focus:border-[#FF5733] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f]/50"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 rounded border-[#404040] text-[#FF5733] focus:ring-[#ff8a5f]"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-[#b3b3b3]">
              I agree to the{" "}
              <Link href="/terms" className="text-[#2E86AB] hover:text-[#FF5733]">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#2E86AB] hover:text-[#FF5733]">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-[#FF5733] px-4 py-2 text-white transition-colors hover:bg-[#ff8a5f] focus:outline-none focus:ring-2 focus:ring-[#ff8a5f] focus:ring-offset-2"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-[#b3b3b3]">Already have an account? </span>
          <Link href="/login" className="font-medium text-[#2E86AB] hover:text-[#FF5733]">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
