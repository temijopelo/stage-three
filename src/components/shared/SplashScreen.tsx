const SplashScreen = () => {
  return (
    <div
      data-testid="splash-screen"
      className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-violet-600 to-indigo-700"
    >
      <div className="text-center">
        <div className="text-6xl mb-4">✦</div>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Habit Tracker
        </h1>
        <p className="mt-2 text-violet-200 text-sm">Build habits that stick.</p>
        <div className="mt-8 flex gap-1.5 justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
