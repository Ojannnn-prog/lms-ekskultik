const fs = require('fs');

const courseDetailPagePath = 'c:/Project/lms_ekskulTIK/src/app/student/course/[id]/page.tsx';
const gamificationPagePath = 'c:/Project/lms_ekskulTIK/src/app/student/gamification/page.tsx';

function replaceInFile(filePath, replacements, addImport = true) {
  let content = fs.readFileSync(filePath, 'utf8');

  for (const [search, replace] of replacements) {
    if (typeof search === 'string') {
        content = content.split(search).join(replace);
    } else {
        content = content.replace(search, replace);
    }
  }
  
  if (addImport && !content.includes('useLanguage')) {
    // Add import after the last import
    const importMatch = content.match(/import .* from ".*";\n/g);
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1];
      content = content.replace(lastImport, lastImport + 'import { useLanguage } from "@/providers/LanguageProvider";\n');
    }
    
    // Add hook
    const componentMatch = content.match(/export default function .*\(\) {/);
    if (componentMatch) {
      content = content.replace(componentMatch[0], componentMatch[0] + '\n  const { t } = useLanguage();');
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

replaceInFile(courseDetailPagePath, [
  ["description: `Materi tidak ditemukan`", "description: t('student.resourceNotFound')"],
  ["description: `Tunggu ${formatCountdown(countdown)} menit sebelum menyelesaikan modul`", "description: t('student.waitBeforeComplete', { minutes: formatCountdown(countdown) })"],
  ['title: "Modul Sudah Selesai 📚"', 'title: t("student.moduleAlreadyCompletedTitle")'],
  ['"Kamu telah menyelesaikan modul materi pembelajaran ini sebelumnya."', 't("student.moduleAlreadyCompletedDesc")'],
  ['primaryButtonText: "Kembali ke Daftar Materi"', 'primaryButtonText: t("student.backToCourseList")'],
  ['secondaryButtonText: "Tutup"', 'secondaryButtonText: t("student.close")'],
  ['title: "Modul Berhasil Diselesaikan! 🎉"', 'title: t("student.moduleCompletedSuccessTitle")'],
  ['"Selamat! Kamu telah menuntaskan mempelajari materi ini dan berhak mendapatkan hadiah poin gamifikasi."', 't("student.moduleCompletedSuccessDesc")'],
  ['`+${res.pointsEarned} Poin Gamifikasi Diberikan${', '`${res.pointsEarned} ${t("student.pointsAwarded")}${'],
  ['res.newTitleUnlocked ? ` • Gelar: ${res.newTitleUnlocked}` : ""', 'res.newTitleUnlocked ? ` • ${t("student.titleGranted")} ${res.newTitleUnlocked}` : ""'],
  ['secondaryButtonText: "Tetap di Materi Ini"', 'secondaryButtonText: t("student.stayOnMaterial")'],
  ["description: `Gagal menyimpan progress penyelesaian`", "description: t('student.failedToSaveProgress')"],
  ["description: `Pilih salah satu opsi jawaban (A, B, C, atau D)`", "description: t('student.selectAnswerOption')"],
  ['title: "Jawaban Kamu Benar! 🌟"', 'title: t("student.correctAnswerTitle")'],
  ['"Luar biasa! Pemahamanmu mengenai materi modul ini sangat tepat dan akurat."', 't("student.correctAnswerDesc")'],
  ['`+${res.pointsEarned} Poin Hadiah Kuis${', '`+${res.pointsEarned} ${t("student.quizPointsAwarded")}${'],
  ['primaryButtonText: "Lihat Peringkat & Gelar Saya"', 'primaryButtonText: t("student.viewRankAndTitle")'],
  ['title: "Jawaban Belum Tepat 🤔"', 'title: t("student.wrongAnswerTitle")'],
  ['"Jangan menyerah! Coba baca kembali artikel materi di atas dengan teliti, lalu pilih jawaban lain yang paling tepat."', 't("student.wrongAnswerDesc")'],
  ['primaryButtonText: "Coba Lagi"', 'primaryButtonText: t("student.tryAgain")'],
  ["description: `Gagal mengirim jawaban kuis`", "description: t('student.failedToSubmitQuiz')"],
  ['<span>Kembali ke Daftar Materi</span>', '<span>{t("student.backToCourseList")}</span>'],
  ['Tipe: {resource.type}', '{t("student.type")} {resource.type}'],
  ['<span>Modul Selesai</span>', '<span>{t("student.moduleFinished")}</span>'],
  ['<span>+{resource.pointsReward} Poin Gamifikasi</span>', '<span>+{resource.pointsReward} {t("student.gamificationPoints")}</span>'],
  ['<span>Materi Pembelajaran</span>', '<span>{t("student.learningMaterial")}</span>'],
  ['"Tidak ada detail materi tambahan."', 't("student.noAdditionalDetails")'],
  ['Kuis Interaktif Modul', '{t("student.interactiveQuiz")}'],
  ['+{resource.pointsReward} Poin Gamifikasi', '+{resource.pointsReward} {t("student.gamificationPoints")}'],
  ['{submittingQuiz ? "Memeriksa..." : "Kirim Jawaban Kuis"}', '{submittingQuiz ? t("student.checking") : t("student.submitQuiz")}'],
  ['Selamat! Jawaban Kamu Benar! 🎉', '{t("student.quizSuccess")}'],
  ['Kamu mendapatkan{" "}', '{t("student.youGot")}{" "}'],
  ['+{quizResult.pointsEarned} Poin', '+{quizResult.pointsEarned} {t("student.points")}'],
  ['hadiah dan menyelesaikan modul ini!', '{t("student.rewardAndCompleted")}'],
  ['Gelar Baru Terbuka: {quizResult.newTitleUnlocked}!', '{t("student.newTitleUnlocked")} {quizResult.newTitleUnlocked}!'],
  ['Jawaban Masih Belum Tepat', '{t("student.answerStillWrong")}'],
  ['Jangan menyerah! Baca kembali materi di atas dan cobalah memilih jawaban lain yang paling tepat.', '{t("student.dontGiveUpRetry")}'],
  ['Modul Telah Diselesaikan!', '{t("student.moduleHasBeenCompleted")}'],
  ['Pelajari Materi Terlebih Dahulu', '{t("student.studyMaterialFirst")}'],
  ['Modul Siap Ditandai Selesai!', '{t("student.moduleReadyToComplete")}'],
  ['"Kamu telah menyelesaikan materi ini dan mendapatkan poin hadiah."', 't("student.completedDesc")'],
  ['`Tunggu ${formatCountdown(', 't("student.waitToCompleteDesc", { time: formatCountdown('],
  [')} menit sebelum kamu dapat menekan tombol selesai dan mendapatkan poin.`', ') })'],
  ['`Klik tombol di sebelah kanan untuk menyelesaikan modul dan mengklaim +${', 't("student.clickToCompleteDesc", { points: '],
  ['resource.pointsReward', 'resource.pointsReward'],
  ['} Poin Gamifikasi.`', ' })'],
  ['<span>Selesai & Lulus</span>', '<span>{t("student.finishedAndPassed")}</span>'],
  ['<span>Selesai & Tandai ({formatCountdown(countdown)})</span>', '<span>{t("student.finishAndMark")} ({formatCountdown(countdown)})</span>'],
  ['isMarkingCompleted\n                      ? "Menyimpan..."\n                      : `Selesai & Tandai (+${resource.pointsReward} Poin)`', 'isMarkingCompleted\n                      ? t("student.saving")\n                      : `${t("student.finishAndMark")} (+${resource.pointsReward} ${t("student.points")})`'],
  ["title: 'Perhatian'", "title: t('student.attention')"]
]);

replaceInFile(gamificationPagePath, [
  ["description: `Gagal memuat data gamifikasi`", "description: t('student.fetchGamificationError')"],
  ['title: "Avatar KTA Berhasil Disimpan! 🎨"', 'title: t("student.avatarSavedTitle")'],
  ['"Tampilan KTA Digital kamu telah diperbarui dengan kreasi avatar barumu."', 't("student.avatarSavedDesc")'],
  ['badgeText: "Status: Avatar KTA Digital Aktif"', 'badgeText: t("student.avatarStatusActive")'],
  ['title: "Gelar Kehormatan Dipasang! 👑"', 'title: t("student.titleEquippedTitle")'],
  ['"Gelar lamamu telah diganti dan sekarang terlihat resmi di KTA Digital serta Peringkat 10 Besar."', 't("student.titleEquippedDesc")'],
  ['`Gelar Aktif Sekarang: ${title}`', '`${t("student.activeTitleNow")} ${title}`'],
  ["description: `Gagal mengganti gelar`", "description: t('student.failedToChangeTitle')"],
  ['Modul Gamifikasi Siswa', '{t("student.gamificationModule")}'],
  ['Toko Gelar, Avatar, & Leaderboard', '{t("student.titleAvatarLeaderboardTitle")}'],
  ['Kumpulkan poin kehadiran dan kuis TIK untuk membuka gelar prestisius serta menduduki posisi puncak klasemen siswa!', '{t("student.gamificationModuleDesc")}'],
  ['Kelas {student?.classGroup}', '{t("student.class")} {student?.classGroup}'],
  ['<span>{student?.activeTitle || "Jagoan Digital"}</span>', '<span>{student?.activeTitle || t("student.digitalHero")}</span>'],
  ['<span>Kustomisasi Karakter Avatar</span>', '<span>{t("student.customizeAvatar")}</span>'],
  ['Koleksi Gelar Prestasi', '{t("student.titleCollection")}'],
  ['Klik gelar yang sudah kamu buka untuk menggunakannya di profil dan papan peringkat', '{t("student.clickTitleToEquip")}'],
  ['Poin Kamu:', '{t("student.yourPoints")}'],
  ['{student?.points} Poin', '{student?.points} {t("student.points")}'],
  ['Gelar awal seluruh siswa Ekskul TIK', 'student.titleDescInitial'], // wait, I can just map them directly
  ['Terbuka setelah mengumpulkan 100 poin', 'student.titleDesc100'],
  ['Terbuka setelah mengumpulkan 200 poin', 'student.titleDesc200'],
  ['Terbuka setelah mengumpulkan 300 poin', 'student.titleDesc300'],
  ['Gelar tertinggi berkat 500 poin belajar', 'student.titleDesc500'],
  ['Aktif', '{t("student.active")}'],
  ['Pasang Gelar', '{t("student.equipTitle")}'],
  ['Butuh {item.minPoints} Pts', '{t("student.need")} {item.minPoints} {t("student.pts")}'],
  ['Papan Peringkat (Leaderboard)', '{t("student.leaderboard")}'],
  ['Siswa dengan poin keaktifan presensi & kuis tertinggi', '{t("student.leaderboardDesc")}'],
  ['Kelas {student?.classGroup}', '{t("student.classX", { group: student?.classGroup || "" })}'], // I replaced "Kelas " already, so this might be tricky, let's fix it later
  ['Semua Kelas (5 & 6)', '{t("student.allClasses")}'],
  ['<th>Rank</th>', '<th>{t("student.rank")}</th>'], // This won't match, let's use string replace
  ['>Rank<', '>{t("student.rank")}<'],
  ['>Nama Siswa<', '>{t("student.studentName")}<'],
  ['>Gelar Aktif<', '>{t("student.activeTitleHead")}<'],
  ['>Poin Gamifikasi<', '>{t("student.gamificationPoints")}<'],
  ['(Kamu)', '{t("student.you")}'],
  ['Kelas {item.classGroup}', '{t("student.classX", { group: item.classGroup })}'],
  ['<span>{item.activeTitle || "Jagoan Digital"}</span>', '<span>{item.activeTitle || t("student.digitalHero")}</span>'],
  ['{item.points} Pts', '{item.points} {t("student.pts")}'],
  ['primaryButtonText="Tutup & Lihat Peringkat"', 'primaryButtonText={t("student.closeAndViewRank")}'],
  ["title: 'Perhatian'", "title: t('student.attention')"]
]);

console.log("Done");
